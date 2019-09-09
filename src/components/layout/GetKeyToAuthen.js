import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import tweb3 from '../../service/tweb3';

import * as actions from '../../store/actions';
import { codec } from '@iceteachain/common';
import { wallet } from '../../helper';
import { decode } from '../../helper';
import CommonDialog from '../pages/Propose/CommonDialog';
import TextField from '@material-ui/core/TextField';
import { SnackbarProvider, useSnackbar } from 'notistack';

export default function GetKeyToAuthen(props) {
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const encryptedData = useSelector(state => state.account.encryptedData);
  const needAuth = useSelector(state => state.account.needAuth);
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  useEffect(() => {
    const handleUserKeyPress = function(event) {
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
    const password = event.target.value;
    setPassword(password);
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
          const address = wallet.getAddressFromPrivateKey(privateKey);
          const account = { address, privateKey, cipher: password };
          console.log('view account', account);
          tweb3.wallet.importAccount(privateKey);
          tweb3.wallet.defaultAccount = address;
          const result = setAccount(account);
          console.log('view result', result);
          setTimeout(() => {
            setLoading(false);
            enqueueSnackbar('I love snacks.');
            close();
          }, 50);
        } catch (err) {
          console.log(err);
          setLoading(false);
          enqueueSnackbar('This is a warning message!', 'warning');
        }
      }, 100);
    }
  }

  return needAuth ? (
    <CommonDialog title="Password Confirm" okText="Confirm" close={close} confirm={confirm}>
      <SnackbarProvider>
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
      </SnackbarProvider>
    </CommonDialog>
  ) : null;
}

// const mapStateToProps = state => {
//   const { account, globalData } = state;
//   return {
//     needAuth: account.needAuth,
//     address: account.address,
//     encryptedData: account.encryptedData,
//     childKey: account.childKey,
//     triggerElement: globalData.triggerElement,
//   };
// };

// GetKeyToAuthen.defaultProps = {
//   needAuth: true,
//   setAccount() {},
//   setNeedAuth() {},
//   dispatch() {},
//   triggerElement: null,
// };

// const mapDispatchToProps = dispatch => {
//   return {
//     setAccount: data => {
//       dispatch(actions.setAccount(data));
//     },
//     setNeedAuth: data => {
//       dispatch(actions.setNeedAuth(data));
//     },
//     setAuthEle: data => {
//       dispatch(actionsGlobal.setAuthEle(data));
//     },
//     setLoading: value => {
//       dispatch(actionsGlobal.setLoading(value));
//     },
//   };
// };

// export default connect(
//   mapStateToProps,
//   mapDispatchToProps
// )(GetKeyToAuthen);
