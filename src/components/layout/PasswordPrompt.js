import React, { useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useSnackbar } from 'notistack';
import { codec } from '@iceteachain/common';
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import { withRouter } from 'react-router-dom';

import { getWeb3, grantAccessToken } from '../../service/tweb3';
import * as actions from '../../store/actions';
// import { wallet, decode, savetoLocalStorage } from '../../helper';
import { wallet, decode } from '../../helper';
import { useRemember } from '../../helper/hooks';
import CommonDialog from '../elements/CommonDialog';
// import { encode } from '../../helper/encode';

const LOGIN_BY_PRIVATEKEY = 0;
const LOGIN_BY_MNEMONIC = 1;

function PasswordPrompt(props) {
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const encryptedData = useSelector(state => state.account.encryptedData);
  const needAuth = useSelector(state => state.account.needAuth);
  const addressRedux = useSelector(state => state.account.address);
  const [isRemember, setIsRemember] = useRemember();

  let credLoading = useRef(false);
  const [autoPassFailed, _setAutoPassFailed] = useState(false);
  const setAutoPassFailed = () => {
    _setAutoPassFailed(true);
    credLoading.current = false;
  };

  const { enqueueSnackbar } = useSnackbar();

  if (!addressRedux) {
    setPathName(window.location.pathname);
    setNeedAuth(false);
    props.history.push('/register');
    return null;
  }

  if (!autoPassFailed && !credLoading.current && window.PasswordCredential) {
    credLoading.current = true;
    navigator.credentials
      .get({
        password: true,
        mediation: 'silent',
      })
      .then(cred => {
        // because we use silent mediation
        // it only goes here if we have 01 saved pass
        if (cred && cred.password) {
          confirm(cred.password, true);
        } else {
          setAutoPassFailed();
        }
      })
      .catch(err => {
        setAutoPassFailed();
        console.warn(err);
      });
  }

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

  function confirm(decryptPass, isAuto) {
    if (encryptedData) {
      if (!decryptPass) {
        return;
      }
      setLoading(true);
      //setTimeout(() => {
      try {
        const decodeOutput = decode(decryptPass, encryptedData);
        let mode = LOGIN_BY_PRIVATEKEY;
        let privateKey;
        let address;
        if (wallet.isMnemonic(decodeOutput)) {
          const account = wallet.getAccountFromMneomnic(decodeOutput);
          ({ privateKey, address } = account);
          mode = LOGIN_BY_MNEMONIC;
        } else {
          privateKey = decodeOutput;
          address = wallet.getAddressFromPrivateKey(privateKey);
        }

        const tweb3 = getWeb3();
        tweb3.wallet.importAccount(privateKey);

        const token = tweb3.wallet.createRegularAccount();
        grantAccessToken(address, token.address, isRemember).then(({ returnValue }) => {
          tweb3.wallet.importAccount(token.privateKey);
          // const keyObject = encode(privateKey, decryptPass);
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
            mnemonic: mode === LOGIN_BY_MNEMONIC ? decodeOutput : '',
            mode,
            tokenAddress: token.address,
            tokenKey: token.privateKey,
            cipher: decryptPass,
          };
          setAccount(account);

          //setTimeout(() => {
          close();
          if (typeof needAuth === 'function') {
            needAuth({ address, tokenAddress: token.address, tokenKey: token.privateKey });
          }
          //}, 50);
        });
      } catch (error) {
        if (isAuto) {
          setAutoPassFailed();
        } else {
          console.error(error);
          const message = 'The password is invalid. Please try again.';
          enqueueSnackbar(message, { variant: 'error' });
        }
      } finally {
        setLoading(false);
      }
      //}, 100);
    }
  }

  function handleConfirm() {
    confirm(password);
  }

  return (!credLoading.current || autoPassFailed) && needAuth ? (
    <CommonDialog
      title="Password Confirm"
      okText="Confirm"
      close={close}
      confirm={handleConfirm}
      onKeyReturn
      hasParentDialog
      ensureTopLevel
    >
      <TextField
        id="Password"
        label="Password"
        placeholder="Enter your password"
        fullWidth
        autoFocus
        margin="normal"
        onChange={passwordChange}
        type="password"
        autoComplete="current-password"
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

export default withRouter(PasswordPrompt);
