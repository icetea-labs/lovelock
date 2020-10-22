import React, { useState } from 'react';
import { encode as codecEncode } from '@iceteachain/common/src/codec';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { withStyles, makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import { useSnackbar } from 'notistack';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import { FormattedMessage } from 'react-intl';

import { wallet, savetoLocalStorage } from '../../../../helper';
import { ButtonPro, LinkPro } from '../../../elements/Button';
import * as actionGlobal from '../../../../store/actions/globalData';
import * as actionAccount from '../../../../store/actions/account';
import * as actionCreate from '../../../../store/actions/create';
import { getWeb3, grantAccessToken } from '../../../../service/tweb3';
import { DivControlBtnKeystore } from '../../../elements/StyledUtils';
import { useRemember } from '../../../../helper/hooks';
import { encode } from '../../../../helper/encode';
import { IceteaId } from 'iceteaid-web';

const i = new IceteaId('xxx');

const styles = (theme) => ({
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

const useStyles = makeStyles((theme) => ({
  formCtLb: {
    '@media (max-width: 768px)': {
      marginTop: theme.spacing(3),
      marginBottom: theme.spacing(3),
    },
  },
}));

function ByMnemonic(props) {
  const { setLoading, setAccount, setStep, history, language } = props;
  const [password, setPassword] = useState('');
  const [rePassErr] = useState('');
  const [isRemember, setIsRemember] = useRemember();
  const ja = 'ja';
  const inputRecovery = '回復フレーズまたはキーを入力してください';
  const inputPassword = 'パスワードを入力してください';

  const { enqueueSnackbar } = useSnackbar();

  async function gotoLogin(e) {
    e.preventDefault();

    const phrase = props.recoveryPhase.trim();
    let message = '';

    if (!phrase) {
      if (language === ja) {
        message = inputRecovery;
      } else {
        message = 'Please input recovery phrase or key.';
      }
      enqueueSnackbar(message, { variant: 'error' });
      return;
    }

    if (!password) {
      if (language === ja) {
        message = inputPassword;
      } else {
        message = 'Please input new password.';
      }
      enqueueSnackbar(message, { variant: 'error' });
      return;
    }

    setLoading(true);
    // setTimeout(async () => {
    try {
      let privateKey = phrase;
      let address;
      let mnemonic;
      let mode = 0;
      if (wallet.isMnemonic(phrase)) {
        const recoveryAccount = wallet.getAccountFromMneomnic(phrase);
        ({ privateKey, address } = recoveryAccount);
        mode = 1;
        mnemonic = phrase;
      } else {
        try {
          address = wallet.getAddressFromPrivateKey(privateKey);
        } catch (err) {
          err.showMessage = 'Invalid recovery phrase.';
          throw err;
        }
      }
      const tweb3 = getWeb3();
      const acc = tweb3.wallet.importAccount(privateKey);
      // tweb3.wallet.defaultAccount = address;

      // check if account is a regular address
      if (!tweb3.utils.isRegularAccount(acc.address)) {
        const m = 'The recovery phrase is for a bank account. LoveLock only accepts regular (non-bank) account.';
        const error = new Error(m);
        error.showMessage = m;
        throw error;
      }

      const token = tweb3.wallet.createRegularAccount();
      grantAccessToken(address, token.address, isRemember).then(({ returnValue }) => {
        tweb3.wallet.importAccount(token.privateKey);
        const keyObject = encode(phrase, password);
        const storage = isRemember ? localStorage : sessionStorage;
        // save token account
        storage.sessionData = codecEncode({
          contract: process.env.REACT_APP_CONTRACT,
          tokenAddress: token.address,
          tokenKey: token.privateKey,
          expireAfter: returnValue,
        }).toString('base64');
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
    props.setRecoveryPhase(value);
  }

  function loginWithPrivatekey() {
    let user = localStorage.getItem('user') || sessionStorage.getItem('user');
    user = (user && JSON.parse(user)) || {};
    const addr = user.address;
    if (props.isSyncAccount) {
      setStep('one');
      return history.push('/loginIceteaid');
    }
    if (addr) {
      setStep('one');
    } else history.goBack();
  }

  const classes = useStyles();

  return (
    <form onSubmit={gotoLogin}>
      <TextField
        id="outlined-multiline-static"
        label={<FormattedMessage id="login.recoveryLabel" />}
        placeholder={language === ja ? inputRecovery : 'Enter your Recovery phrase or key'}
        multiline
        rows="4"
        onKeyDown={(e) => e.keyCode === 13 && gotoLogin(e)}
        onChange={handleMnemonic}
        margin="normal"
        variant="outlined"
        fullWidth
        helperText={rePassErr}
        error={rePassErr !== ''}
        autoFocus
        value={props.recoveryPhase}
      />
      <LinkPro onClick={() => props.setIsQRCodeActive(true)}>
        <FormattedMessage id="login.qrCode" />
      </LinkPro>
      <TextField
        id="rePassword"
        label={<FormattedMessage id="login.newPassLabel" />}
        placeholder={language === ja ? inputPassword : 'Enter your password'}
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
        label={<FormattedMessage id="login.rememberMe" />}
        className={classes.formCtLb}
      />
      <DivControlBtnKeystore>
        <ButtonPro color="primary" className="backBtn" onClick={loginWithPrivatekey}>
          <FormattedMessage id="login.btnBack" />
        </ButtonPro>
        <ButtonPro variant="contained" color="primary" className="nextBtn" type="submit">
          <FormattedMessage id="login.btnRecover" />
        </ButtonPro>
      </DivControlBtnKeystore>
    </form>
  );
}

const mapStateToProps = (state) => {
  return {
    language: state.globalData.language,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    setAccount: (value) => {
      dispatch(actionAccount.setAccount(value));
    },
    setStep: (value) => {
      dispatch(actionCreate.setStep(value));
    },
    setLoading: (value) => {
      dispatch(actionGlobal.setLoading(value));
    },
  };
};

export default withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(withRouter(ByMnemonic)));
