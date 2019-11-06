import React, { useState } from 'react';
import { codec } from '@iceteachain/common';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import { useSnackbar } from 'notistack';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import CheckBoxIcon from '@material-ui/icons/CheckBox';

import { wallet, savetoLocalStorage } from '../../../../helper';
import { ButtonPro } from '../../../elements/Button';
import * as actionGlobal from '../../../../store/actions/globalData';
import * as actionAccount from '../../../../store/actions/account';
import * as actionCreate from '../../../../store/actions/create';
import { getWeb3, grantAccessToken } from '../../../../service/tweb3';
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
  const [password, setPassword] = useState('');
  const [valueInput, setValueInput] = useState('');
  const [rePassErr] = useState('');
  const [isRemember, setIsRemember] = useState(true);

  const { enqueueSnackbar } = useSnackbar();

  async function gotoLogin(e) {
    e.preventDefault()

    const phrase = valueInput.trim()

    if (!phrase) {
      enqueueSnackbar('Please input recovery phrase or key.', { variant: 'error' });
      return
    }

    if (!password) {
      enqueueSnackbar('Please input new password.', { variant: 'error' });
      return
    }

    setLoading(true);
    // setTimeout(async () => {
      try {
        let privateKey = phrase;
        let address;
        let mode = 0;
        if (wallet.isMnemonic(phrase)) {
          const recoveryAccount = wallet.getAccountFromMneomnic(phrase);
          ({ privateKey, address } = recoveryAccount);
          mode = 1;
        } else {
          try {
            address = wallet.getAddressFromPrivateKey(privateKey);
          } catch (err) {
            err.showMessage = 'Invalid recovery phrase.'
            throw err
          }
        }
        // console.log('getAddressFromPrivateKey', privateKey);

        const tweb3 = getWeb3()
        const acc = tweb3.wallet.importAccount(privateKey);
        // tweb3.wallet.defaultAccount = address;

        // check if account is a regular address
        if (!tweb3.utils.isRegularAccount(acc.address)) {
          const m = 'The recovery phrase is for a bank account. LoveLock only accepts regular (non-bank) account.'
          const error = new Error(m);
          error.showMessage = m
          throw error
        }

        const token = tweb3.wallet.createRegularAccount();
        grantAccessToken(address, token.address, isRemember)
          .then(({ returnValue }) => {
            tweb3.wallet.importAccount(token.privateKey);
            const keyObject = encode(phrase, password);
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
            // save main account
            savetoLocalStorage({ address, mode, keyObject });
            const account = {
              address,
              privateKey,
              tokenAddress: token.address,
              tokenKey: token.privateKey,
              cipher: password,
              encryptedData: keyObject,
              mode,
              mnemonic: mode === 1 ? phrase : '',
            };
            setAccount(account);
            setLoading(false);
            history.push('/');
          });
      } catch (error) {
        console.warn(error);
        const m = error.showMessage || `An error occurred: ${error.message || 'unknown'}`;
        enqueueSnackbar(m, { variant: 'error' });
        setLoading(false);
      }
      // setLoading(false);
    //}, 100);
  }

  function handlePassword(event) {
    const { value } = event.target;
    setPassword(value);
  }

  function handleMnemonic(event) {
    const value = event.target.value.trim();
    setValueInput(value);
  }

  function loginWithPrivatekey() {
    let user = localStorage.getItem('user') || sessionStorage.getItem('user');
    user = (user && JSON.parse(user)) || {};
    const addr = user.address;
    if (addr) {
      setStep('one');
    } else history.goBack();
  }

  return (
    <form onSubmit={gotoLogin}>
      <TextField
        id="outlined-multiline-static"
        label="Recovery phrase or key"
        placeholder="Enter your Recovery phrase or key"
        multiline
        rows="4"
        onKeyDown={e => e.keyCode === 13 && gotoLogin(e)}
        onChange={handleMnemonic}
        margin="normal"
        variant="outlined"
        fullWidth
        helperText={rePassErr}
        error={rePassErr !== ''}
        autoFocus
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
        autoComplete="new-password"
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
        <ButtonPro color="primary" onClick={loginWithPrivatekey}>
          Back
        </ButtonPro>
        <ButtonPro variant="contained" color="primary" type="submit">
          Recover
        </ButtonPro>
      </DivControlBtnKeystore>
    </form>
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
