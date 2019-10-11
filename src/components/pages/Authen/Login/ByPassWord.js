import React, { useEffect, useState } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { codec } from '@iceteachain/common';
import { ValidatorForm, TextValidator } from 'react-material-ui-form-validator';
import { makeStyles } from '@material-ui/core/styles';
import { useSnackbar } from 'notistack';
import { Grid, TextField } from '@material-ui/core';
import { AvatarPro } from '../../../elements';

import tweb3 from '../../../../service/tweb3';
import { wallet, decode, getTagsInfo, savetoLocalStorage } from '../../../../helper';
import * as actionGlobal from '../../../../store/actions/globalData';
import * as actionAccount from '../../../../store/actions/account';
import * as actionCreate from '../../../../store/actions/create';
import { DivControlBtnKeystore } from '../../../elements/StyledUtils';
import { ButtonPro, LinkPro } from '../../../elements/Button';
import { encode } from '../../../../helper/encode';

const useStyles = makeStyles(theme => ({
  avatar: {
    marginTop: theme.spacing(1),
  },
}));

function ByPassWord(props) {
  const { setLoading, setAccount, setStep, history, encryptedData } = props;
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [avatar, setAvatar] = useState('');
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    loaddata();
  }, []);

  async function loaddata() {
    const { address } = props;
    if (address) {
      const reps = await getTagsInfo(address);
      if (reps) {
        setUsername(reps['display-name'] || '');
        setAvatar(reps.avatar);
      }
    } else {
      setUsername('undefined');
    }
  }

  async function gotoLogin() {
    if (encryptedData) {
      setLoading(true);

      setTimeout(() => {
        try {
          const privateKey = codec.toString(decode(password, encryptedData).privateKey);
          const address = wallet.getAddressFromPrivateKey(privateKey);
          // const account = { address, privateKey, cipher: password };
          tweb3.wallet.importAccount(privateKey);
          // tweb3.wallet.defaultAccount = address;
          const rememberMe = true;
          const token = tweb3.wallet.createRegularAccount();
          const ms = tweb3.contract('system.did').methods;
          const expire = rememberMe ? process.env.REACT_APP_TIME_EXPIRE : process.env.REACT_APP_DEFAULT_TIME_EXPIRE;
          // console.log('expire', expire);
          ms.grantAccessToken(
            address,
            [process.env.REACT_APP_CONTRACT, 'system.did'],
            token.address,
            parseInt(expire, 10)
          )
            .sendCommit({ from: address })
            .then(({ returnValue }) => {
              tweb3.wallet.importAccount(token.privateKey);
              const keyObject = encode(privateKey, password);
              const storage = rememberMe ? localStorage : sessionStorage;
              // save token account
              storage.sessionData = codec
                .encode({
                  contract: process.env.REACT_APP_CONTRACT,
                  tokenAddress: token.address,
                  tokenKey: token.privateKey,
                  expireAfter: returnValue,
                })
                .toString('base64');
              // re-save main account
              savetoLocalStorage(address, keyObject);
              const account = {
                address,
                privateKey,
                tokenAddress: token.address,
                tokenKey: token.privateKey,
                cipher: password,
                encryptedData: keyObject,
              };
              setAccount(account);
              setLoading(false);
              setTimeout(() => {
                history.push('/');
              }, 1);
            });
        } catch (err) {
          console.log('e1', err);
          const message = 'Your password is invalid. Please try again.';
          enqueueSnackbar(message, { variant: 'error' });
          setLoading(false);
        }
      }, 100);
    } else {
      const message = `An error has occured. Please try using forgot password.`;
      enqueueSnackbar(message, { variant: 'error' });
    }
  }

  function handlePassword(event) {
    const { value } = event.currentTarget;
    setPassword(value);
  }

  function loginWithSeed() {
    setStep('two');
  }
  const classes = useStyles();

  return (
    <React.Fragment>
      <Grid className={classes.avatar} container spacing={2} alignItems="flex-end">
        <Grid item>
          <AvatarPro hash={avatar} />
        </Grid>
        <Grid item>
          <TextField label="Username" value={username} disabled />
        </Grid>
      </Grid>
      <ValidatorForm onSubmit={gotoLogin}>
        <TextValidator
          label="Password"
          fullWidth
          onChange={handlePassword}
          name="password"
          type="password"
          validators={['required']}
          errorMessages={['This field is required']}
          margin="normal"
          value={password}
        />
        <DivControlBtnKeystore>
          <LinkPro onClick={loginWithSeed}>Forgot password?</LinkPro>
          <ButtonPro type="submit">Login</ButtonPro>
        </DivControlBtnKeystore>
      </ValidatorForm>
    </React.Fragment>
  );
}

const mapStateToProps = state => {
  return {
    encryptedData: state.account.encryptedData,
    address: state.account.address,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    setAccount: value => {
      dispatch(actionAccount.setAccount(value));
    },
    setStep: value => {
      dispatch(actionCreate.setStep(value));
    },
    setLoading: value => {
      dispatch(actionGlobal.setLoading(value));
    },
  };
};

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(ByPassWord)
);
