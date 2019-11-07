import React, { useEffect, useState } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { codec } from '@iceteachain/common';
import { ValidatorForm, TextValidator } from 'react-material-ui-form-validator';
import { makeStyles } from '@material-ui/core/styles';
import { useSnackbar } from 'notistack';
import { Grid, TextField } from '@material-ui/core';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import CheckBoxIcon from '@material-ui/icons/CheckBox';

import { AvatarPro } from '../../../elements';
import { getWeb3, grantAccessToken} from '../../../../service/tweb3';
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
  const [state, setState] = React.useState({
    username: '',
    avatar: '',
  });
  const [password, setPassword] = useState('');
  const [isRemember, setIsRemember] = useState(true);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    async function loadData() {
      const { address } = props;
      if (address) {
        const reps = await getTagsInfo(address);
        if (reps) {
          setState({ ...state, username: reps['display-name'] || '', avatar: reps.avatar });
        }
      } else {
        setState({ ...state, username: 'undefined' });
        const message = 'This is the first time log in on this machine. If you created an account on another machine, please enter recovery phrase.';
        enqueueSnackbar(message, { variant: 'info', autoHideDuration: 15000, anchorOrigin: {vertical: 'top', horizontal: 'center'} });
        setStep('two');
      }
    }

    loadData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function gotoLogin() {
    if (encryptedData) {
      setLoading(true);

      setTimeout(() => {
        try {
          const decodeOutput = decode(password, encryptedData);
          let mode = 0;
          let privateKey;
          let address;
          if (wallet.isMnemonic(decodeOutput)) {
            const account = wallet.getAccountFromMneomnic(decodeOutput);
            ({ privateKey, address } = account);
            mode = 1;
          } else {
            privateKey = decodeOutput;
            address = wallet.getAddressFromPrivateKey(privateKey);
          }

          // const privateKey = codec.toString(decode(password, encryptedData).privateKey);
          // const address = wallet.getAddressFromPrivateKey(privateKey);
          // const account = { address, privateKey, cipher: password };
          const tweb3 = getWeb3()
          tweb3.wallet.importAccount(privateKey);
          // tweb3.wallet.defaultAccount = address;

          const token = tweb3.wallet.createRegularAccount();
          grantAccessToken(address, token.address, isRemember)
            .then(({ returnValue }) => {
              tweb3.wallet.importAccount(token.privateKey);
              const keyObject = encode(privateKey, password);
              const storage = isRemember ? localStorage : sessionStorage;
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
              savetoLocalStorage({ address, mode, keyObject });
              const account = {
                address,
                privateKey,
                tokenAddress: token.address,
                tokenKey: token.privateKey,
                cipher: password,
                encryptedData: keyObject,
                mode,
              };
              setAccount(account);
              setLoading(false);
              setTimeout(() => {
                history.push('/');
              }, 1);
            });
        } catch (error) {
          console.error(error);
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
          <AvatarPro hash={state.avatar} />
        </Grid>
        <Grid item>
          <TextField label="Username" value={state.username} disabled autoComplete="username" />
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
          inputProps={{ autoComplete: "current-password" }}
        />
        <FormControlLabel
          control={
            <Checkbox
              icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
              checkedIcon={<CheckBoxIcon fontSize="small" />}
              value={isRemember}
              checked={isRemember}
              color="primary"
              onChange={() => setIsRemember(!isRemember)}
            />
          }
          label="Remember me for 30 days"
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
