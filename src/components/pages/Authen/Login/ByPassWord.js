import React, { useEffect, useState } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { codec } from '@iceteachain/common';
import { ValidatorForm, TextValidator } from 'react-material-ui-form-validator';
import { withStyles } from '@material-ui/core/styles';
import { useSnackbar } from 'notistack';

import tweb3 from '../../../../service/tweb3';
import { wallet, decode } from '../../../../helper';
import * as actionGlobal from '../../../../store/actions/globalData';
import * as actionAccount from '../../../../store/actions/account';
import * as actionCreate from '../../../../store/actions/create';
import { DivControlBtnKeystore } from '../../../elements/StyledUtils';
import { ButtonPro, LinkPro } from '../../../elements/Button';

const styles = () => ({
  // button: {
  //   margin: theme.spacing(1),
  //   background: 'linear-gradient(332deg, #b276ff, #fe8dc3)',
  // },
});

function ByPassWord(props) {
  const { setLoading, setAccount, setStep, history, encryptedData } = props;
  const [password, setPassword] = useState('');
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    const handleUserKeyPress = event => {
      if (event.keyCode === 13) {
        gotoLogin();
      }
    };
    window.document.body.addEventListener('keydown', handleUserKeyPress);
    return () => {
      window.document.body.removeEventListener('keydown', handleUserKeyPress);
    };
  }, []);

  async function gotoLogin() {
    if (encryptedData) {
      setLoading(true);

      setTimeout(() => {
        try {
          let privateKey = '';
          privateKey = codec.toString(decode(password, encryptedData).privateKey);
          const address = wallet.getAddressFromPrivateKey(privateKey);
          const account = { address, privateKey, cipher: password };
          tweb3.wallet.importAccount(privateKey);
          tweb3.wallet.defaultAccount = address;
          setAccount(account);
          history.push('/');
          setLoading(false);
        } catch (err) {
          const message = 'Your password is invalid. Please try again.';
          enqueueSnackbar(message, { variant: 'error' });
        }

        setLoading(false);
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

  return (
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
  );
}

const mapStateToProps = state => {
  return {
    encryptedData: state.account.encryptedData,
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
  )(withStyles(styles)(ByPassWord))
);
