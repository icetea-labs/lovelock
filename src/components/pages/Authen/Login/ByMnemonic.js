import React, { useEffect, useState } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import { useSnackbar } from 'notistack';

import { wallet, savetoLocalStorage } from '../../../../helper';
import { ButtonPro } from '../../../elements/Button';
import * as actionGlobal from '../../../../store/actions/globalData';
import * as actionAccount from '../../../../store/actions/account';
import * as actionCreate from '../../../../store/actions/create';
import tweb3 from '../../../../service/tweb3';
import { DivControlBtnKeystore } from '../../../elements/StyledUtils';

import { encode } from '../../../../helper/encode';

const styles = theme => ({
  // button: {
  //   margin: theme.spacing(1),
  //   background: 'linear-gradient(332deg, #b276ff, #fe8dc3)',
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    borderWidth: '1px',
    borderColor: 'yellow !important',
  },
});

function ByMnemonic(props) {
  const { setLoading, setAccount, setStep, history } = props;
  const [isPrivateKey, setIsPrivateKey] = useState(false);
  const [password, setPassword] = useState('');
  const [mnemonic, setMnemonic] = useState('');
  const [rePassErr] = useState('');

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
    setLoading(true);
    setTimeout(async () => {
      try {
        let privateKey = '';
        if (isPrivateKey) {
          privateKey = mnemonic;
        } else {
          privateKey = wallet.getPrivateKeyFromMnemonic(mnemonic);
        }

        const address = wallet.getAddressFromPrivateKey(privateKey);
        const account = { address, privateKey, cipher: password };
        setAccount(account);
        tweb3.wallet.importAccount(privateKey);
        tweb3.wallet.defaultAccount = address;

        const keyObject = encode(privateKey, password);
        savetoLocalStorage(address, keyObject);
        history.push('/');
      } catch (err) {
        const message = `An error has occured. Please try again.`;
        enqueueSnackbar(message, { variant: 'error' });
      }
      setLoading(false);
    }, 100);
  }

  function handlePassword(event) {
    const { value } = event.target;
    setPassword(value);
  }

  function handleMnemonic(event) {
    const value = event.target.value.trim();
    if (value.indexOf(' ') < 0) {
      setIsPrivateKey(true);
    }
    setMnemonic(value);
  }

  function loginWithPrivatekey() {
    setStep('one');
  }

  return (
    <div>
      <TextField
        id="outlined-multiline-static"
        label="Recovery phrase or key"
        placeholder="Enter your Recovery phrase or key"
        multiline
        rows="4"
        onChange={handleMnemonic}
        margin="normal"
        variant="outlined"
        fullWidth
        helperText={rePassErr}
        error={rePassErr !== ''}
      />
      <TextField
        id="rePassword"
        label="New Password"
        placeholder="Enter your password"
        helperText={rePassErr}
        error={rePassErr !== ''}
        fullWidth
        margin="normal"
        onChange={handlePassword}
        type="password"
      />
      <DivControlBtnKeystore>
        <ButtonPro color="primary" onClick={loginWithPrivatekey}>
          Back
        </ButtonPro>
        <ButtonPro variant="contained" color="primary" onClick={gotoLogin}>
          Recover
        </ButtonPro>
      </DivControlBtnKeystore>
    </div>
  );
}

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

export default withStyles(styles)(
  connect(
    null,
    mapDispatchToProps
  )(withRouter(ByMnemonic))
);
