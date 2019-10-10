import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useSnackbar } from 'notistack';
import { codec } from '@iceteachain/common';
import TextField from '@material-ui/core/TextField';
import tweb3 from '../../service/tweb3';
import * as actions from '../../store/actions';
import { wallet, decode } from '../../helper';
import CommonDialog from '../pages/Propose/CommonDialog';

export default function GetKeyToAuthen() {
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const encryptedData = useSelector(state => state.account.encryptedData);
  const needAuth = useSelector(state => state.account.needAuth);
  const address = useSelector(state => state.account.address);

  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    const handleUserKeyPress = event => {
      if (event.keyCode === 13) {
        confirm();
      }
      if (event.keyCode === 27) {
        close();
      }
    };
    window.document.body.addEventListener('keydown', handleUserKeyPress);
    return () => {
      window.document.body.removeEventListener('keydown', handleUserKeyPress);
    };
  }, [password]);

  function setLoading(value) {
    dispatch(actions.setLoading(value));
  }

  function setAccount(value) {
    dispatch(actions.setAccount(value));
  }

  function passwordChange(event) {
    const { value } = event.target;
    setPassword(value);
  }

  function setNeedAuth(value) {
    dispatch(actions.setNeedAuth(value));
  }

  function close() {
    setNeedAuth(false);
  }

  function confirm() {
    if (encryptedData) {
      if (!password) {
        return;
      }
      setLoading(true);

      setTimeout(() => {
        try {
          let privateKey = '';
          privateKey = codec.toString(decode(password, encryptedData).privateKey);
          // const address = wallet.getAddressFromPrivateKey(privateKey);
          const account = { privateKey, cipher: password };
          // console.log('view account', account);
          tweb3.wallet.importAccount(privateKey);
          // tweb3.wallet.defaultAccount = address;
          setAccount(account);
          // console.log('view result', result);
          setTimeout(() => {
            setLoading(false);
            close();
          }, 50);
        } catch (err) {
          // console.log(err);
          setLoading(false);
          const message = 'Your password is invalid. Please try again.';
          enqueueSnackbar(message, { variant: 'error' });
        }
      }, 100);
    }
  }

  return needAuth ? (
    <CommonDialog title="Password Confirm" okText="Confirm" close={close} confirm={confirm}>
      <TextField
        id="Password"
        label="Password"
        placeholder="Enter your password"
        fullWidth
        autoFocus
        margin="normal"
        onChange={passwordChange}
        type="password"
      />
    </CommonDialog>
  ) : null;
}
