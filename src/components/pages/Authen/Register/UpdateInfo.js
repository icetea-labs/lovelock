import React, { useState, useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { useDispatch } from 'react-redux';
import { TextValidator, ValidatorForm } from 'react-material-ui-form-validator';
import * as actionCreate from '../../../../store/actions/create';
import { ButtonPro } from '../../../elements/Button';
import { IceteaId } from 'iceteaid-web';
import { makeStyles } from '@material-ui/core/styles';

import {
  applyRotation,
  imageResize,
  isAliasRegistered,
  registerAlias,
  saveFileToIpfs,
  setTagsInfo,
  wallet,
} from '../../../../helper';
import getWeb3 from '../../../../service/tweb3';
import { setAccount, setLoading, setStep } from '../../../../store/actions';
import { useHistory } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import TextField from '@material-ui/core/TextField';

const i = new IceteaId('xxx');

const useStyles = makeStyles((theme) => ({
  rightIcon: {
    marginLeft: theme.spacing(1),
  },
  marginRight: {
    marginRight: theme.spacing(1),
    paddingRight: theme.spacing(1),
  },
  avatarBox: {
    marginTop: theme.spacing(1),
    '@media (max-width: 768px)': {
      marginTop: theme.spacing(3),
    },
  },
  avatar: {
    width: 100,
    height: 100,
  },
  textField: {
    backgroundColor: '#26163E',
    opacity: 0.67,
  },
  input: {
    color: '#FFFFFF',
    borderRadius: 10,
    '&::placeholder': {
      color: '#FFFFFF',
      opacity: 0.67,
    },
  },
  label: {
    color: '#FFFFFF',
    opacity: 0.67,
    '&$focused': {
      opacity: 1,
    },
  },
  button: {
    marginTop: 10,
  },
}));

export default function UpdateInfo({ avatarData }) {
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const dispatch = useDispatch();
  const classes = useStyles();
  const history = useHistory();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    const getAccount = async () => {
      try {
        const { displayName } = await i.user.getMetaData();
        setDisplayName(displayName);
      } catch (err) {
        dispatch(setStep('one'));
        history.push('/');
      }
    };
    getAccount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Fix issue #148
    ValidatorForm.addValidationRule('specialCharacter', async (name) => {
      // const regex = new RegExp('^(?=.{3,20}$)(?![_.])(?!.*[_.]{2})[a-z0-9._]+(?<![_.])$');
      const regex = new RegExp('^(?![_.])(?!.*[_.]{2})[a-z0-9._]+[a-z0-9]$');
      return regex.test(name);
    });

    ValidatorForm.addValidationRule('isAliasRegistered', async (name) => {
      const resp = await isAliasRegistered(name);
      return !resp;
    });
    return () => {
      ValidatorForm.removeValidationRule('specialCharacter');
      ValidatorForm.removeValidationRule('isAliasRegistered');
    };
  }, []);

  const gotoNext = async () => {
    try {
      const key = await i.user.getKey();
      let account;

      if (key) {
        let address;
        let publicKey;
        let { privateKey, encryptionKey, mnemonic } = key;
        const decrypted = await i.user.decryptKey(privateKey, encryptionKey, mnemonic);
        if (wallet.isMnemonic(decrypted.mnemonic)) {
          const recoveryAccount = wallet.getAccountFromMneomnic(decrypted.mnemonic);
          ({ privateKey, address, publicKey } = recoveryAccount);
          account = { privateKey, address, publicKey, mnemonic: decrypted.mnemonic };
        } else {
          try {
            address = wallet.getAddressFromPrivateKey(decrypted.privateKey);
            publicKey = wallet.getPubKeyFromPrivateKey(decrypted.privateKey);
            privateKey = decrypted.privateKey;
            account = { privateKey, address, publicKey, mnemonic: privateKey };
          } catch (err) {
            err.showMessage = 'Invalid recovery phrase.';
            throw err;
          }
        }
      } else {
        account = await i.user.exGenerateAccount();
      }
      const { privateKey, address, publicKey, mnemonic } = account;
      await i.user.updateInfo(username, displayName);
      const tweb3 = getWeb3();
      tweb3.wallet.importAccount(privateKey);
      tweb3.wallet.defaultAccount = address;
      const registerInfo = [];
      const opts = { address };
      // eslint-disable-next-line no-unused-vars
      let avatarUrl;
      if (avatarData) {
        const newFile = await applyRotation(avatarData[0], 1, 500);
        const saveFile = imageResize(avatarData[0], newFile);
        const setAva = saveFileToIpfs(saveFile).then((hash) => {
          avatarUrl = process.env.REACT_APP_IPFS + hash;
          setTagsInfo({ avatar: hash }, opts);
        });
        registerInfo.push(setAva);
      }
      registerInfo.push(
        setTagsInfo(
          {
            'display-name': displayName,
            'pub-key': publicKey,
          },
          opts
        )
      );
      registerInfo.push(registerAlias(username, address));
      await Promise.all(registerInfo);
      const newAccount = {
        address,
        privateKey,
        cipher: password,
        publicKey,
        mnemonic,
      };
      dispatch(setAccount(newAccount));
      dispatch(setLoading(false));
      dispatch(actionCreate.setStep('five'));
      return history.push('/registerSuccess');
    } catch (err) {
      enqueueSnackbar(err.message, { variant: 'error' });
    }
  };

  return (
    <>
      <ValidatorForm onSubmit={gotoNext}>
        <TextValidator
          label={<FormattedMessage id="regist.userName" />}
          fullWidth
          onChange={(event) => {
            // Fix issue #148
            setUsername(event.currentTarget.value.toLowerCase());
          }}
          name="Username"
          validators={['required', 'specialCharacter', 'isAliasRegistered']}
          errorMessages={[
            <FormattedMessage id="regist.requiredMes" />,
            <FormattedMessage id="regist.characterCheck" />,
            <FormattedMessage id="regist.userTaken" />,
          ]}
          margin="dense"
          value={username}
          inputProps={{ autoComplete: 'username' }}
          variant="filled"
          color="secondary"
          className={classes.textField}
          InputProps={{
            className: classes.input,
          }}
          InputLabelProps={{
            className: classes.label,
          }}
        />
        <TextValidator
          label={<FormattedMessage id="regist.displayName" />}
          fullWidth
          onChange={(event) => {
            // Fix issue #148
            setDisplayName(event.currentTarget.value.toLowerCase());
          }}
          name="fullName"
          validators={['required']}
          errorMessages={[<FormattedMessage id="regist.requiredMes" />]}
          margin="dense"
          value={displayName}
          inputProps={{ autoComplete: 'displayName' }}
          variant="filled"
          color="secondary"
          className={classes.textField}
          InputProps={{
            className: classes.input,
          }}
          InputLabelProps={{
            className: classes.label,
          }}
        />
        <TextField
          label={<FormattedMessage id="regist.password" />}
          fullWidth
          onChange={(event) => {
            setPassword(event.currentTarget.value);
          }}
          name="password"
          type="password"
          validators={['required']}
          errorMessages={[<FormattedMessage id="regist.requiredMes" />]}
          margin="dense"
          value={password}
          inputProps={{ autoComplete: 'new-password' }}
          variant="filled"
          color="secondary"
          className={classes.textField}
          InputProps={{
            className: classes.input,
          }}
          InputLabelProps={{
            className: classes.label,
          }}
        />
        <ButtonPro fullWidth type="submit" className={classes.button}>
          <FormattedMessage id="regist.next" />
        </ButtonPro>
      </ValidatorForm>
    </>
  );
}
