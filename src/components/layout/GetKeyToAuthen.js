import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useSnackbar } from 'notistack';
import { codec } from '@iceteachain/common';
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import { withRouter } from 'react-router-dom';

import tweb3 from '../../service/tweb3';
import * as actions from '../../store/actions';
import { wallet, decode, savetoLocalStorage } from '../../helper';
import CommonDialog from '../elements/CommonDialog';
import { encode } from '../../helper/encode';

function GetKeyToAuthen(props) {
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const encryptedData = useSelector(state => state.account.encryptedData);
  const needAuth = useSelector(state => state.account.needAuth);
  const addressRedux = useSelector(state => state.account.address);
  const [isRemember, setIsRemember] = useState(true);

  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    if (!addressRedux) {
      setPathName(window.location.pathname);
      setNeedAuth(false);
      props.history.push('/register');
    }
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

  function setPathName(value) {
    dispatch(actions.setPathName(value));
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
          tweb3.wallet.importAccount(privateKey);

          const token = tweb3.wallet.createRegularAccount();
          const ms = tweb3.contract('system.did').methods;
          const expire = isRemember ? process.env.REACT_APP_TIME_EXPIRE : process.env.REACT_APP_DEFAULT_TIME_EXPIRE;
          ms.grantAccessToken(
            address,
            [process.env.REACT_APP_CONTRACT, 'system.did'],
            token.address,
            parseInt(expire, 10)
          )
            .sendCommit({ from: address })
            .then(({ returnValue }) => {
              tweb3.wallet.importAccount(token.privateKey);
              // const keyObject = encode(privateKey, password);
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
              // savetoLocalStorage(address, keyObject);
              const account = {
                address,
                privateKey,
                mnemonic: mode === 1 ? decodeOutput : '',
                mode,
                tokenAddress: token.address,
                tokenKey: token.privateKey,
                cipher: password,
              };
              setAccount(account);
              setLoading(false);
              setTimeout(() => {
                close();
              }, 50);
            });
        } catch (error) {
          console.error(error);
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
    </CommonDialog>
  ) : null;
}

export default withRouter(GetKeyToAuthen);
