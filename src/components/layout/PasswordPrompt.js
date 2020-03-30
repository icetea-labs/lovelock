import React, { useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useSnackbar } from 'notistack';
import { encode as codecEncode } from '@iceteachain/common/src/codec';
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import { withRouter } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';

import { getWeb3, grantAccessToken } from '../../service/tweb3';
import * as actions from '../../store/actions';
import { wallet, decode } from '../../helper';
import { useRemember } from '../../helper/hooks';
import CommonDialog from '../elements/CommonDialog';
import { LinkPro } from '../elements/Button';

const LOGIN_BY_PRIVATEKEY = 0;
const LOGIN_BY_MNEMONIC = 1;

function PasswordPrompt(props) {
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const encryptedData = useSelector(state => state.account.encryptedData);
  const needAuth = useSelector(state => state.account.needAuth);
  const addressRedux = useSelector(state => state.account.address);
  const [isRemember, setIsRemember] = useRemember();
  const language = useSelector(state => state.globalData.language);

  const credLoading = useRef(false);
  const [autoPassFailed, _setAutoPassFailed] = useState(false);
  const setAutoPassFailed = () => {
    _setAutoPassFailed(true);
    credLoading.current = false;
  };

  const { enqueueSnackbar } = useSnackbar();
  const ja = 'ja';

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
          storage.sessionData = codecEncode({
            contract: process.env.REACT_APP_CONTRACT,
            tokenAddress: token.address,
            tokenKey: token.privateKey,
            expireAfter: returnValue,
          }).toString('base64');
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

  function goToForgotPassScreen() {
    props.history.push('/login');
    dispatch(actions.setStep('two'));
  }

  return (!credLoading.current || autoPassFailed) && needAuth ? (
    <CommonDialog
      title={<FormattedMessage id="passPrompt.passTitle" />}
      okText={<FormattedMessage id="passPrompt.btnConfirm" />}
      close={close}
      confirm={handleConfirm}
      onKeyReturn
      hasParentDialog
      ensureTopLevel
    >
      <TextField
        id="Password"
        label={<FormattedMessage id="passPrompt.pass" />}
        placeholder={language === ja ? 'パスワードを入力してください' : 'Enter your password'}
        fullWidth
        autoFocus
        margin="normal"
        onChange={passwordChange}
        type="password"
        autoComplete="current-password"
      />
      <div>
        <LinkPro onClick={goToForgotPassScreen}>
          <FormattedMessage id="passPrompt.forgot" />
        </LinkPro>
      </div>
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
        label={<FormattedMessage id="passPrompt.remember" />}
      />
    </CommonDialog>
  ) : null;
}

export default withRouter(PasswordPrompt);
