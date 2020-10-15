import React, { useState, useEffect } from 'react';
import QueueAnim from 'rc-queue-anim';
import { FormattedMessage } from 'react-intl';
import { useSelector, useDispatch } from 'react-redux';
import { TextValidator, ValidatorForm } from 'react-material-ui-form-validator';
import { LayoutAuthen, BoxAuthen, ShadowBoxAuthen, DivControlBtnKeystore } from '../../../elements/StyledUtils';
import { HeaderAuthen } from '../../../elements/Common';
import * as actionCreate from '../../../../store/actions/create';
import { ButtonPro } from '../../../elements/Button';
import { IceteaId } from 'iceteaid-web';
import RegisterSuccess from './RegisterSuccess';
import Icon from '@material-ui/core/Icon';
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
import { setAccount, setStep, setLoading } from '../../../../store/actions';
import { getContract } from '../../../../service/tweb3';
import { useHistory } from 'react-router-dom';
const ct = getContract().methods;
const i = new IceteaId('xxx')

const useStyles = makeStyles(theme => ({
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
}));

export default function UpdateInfo({avatarData}) {
  const [displayName, setDisplayName] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const dispatch = useDispatch();
  const step = useSelector(state => state.create.step);
  const classes = useStyles();
  const history = useHistory();

  useEffect(() => {
    dispatch(setStep('one'));
  }, []);

  useEffect(() => {
    const getMetaData = async () => {
      try {
        const key = await i.user.getKey();
        if (key.payload) {
          dispatch(setStep('two'));
          return history.push('/login')
        }
        const user = await i.user.getMetaData();
        if (user.payload && user.payload.loginProvider !== 'mobile') {
          setDisplayName(user.payload.displayName)
          setFullName(user.payload.fullName)
          setPassword(btoa(JSON.stringify(user.payload)))
          const splitUsername = user.payload.username.split('@');
          const username = splitUsername[0];
          const domainName = splitUsername[1].replace('.', '-');
          setUsername(`${username}-${domainName}`)
        }
        if (user.payload && user.payload.loginProvider === 'mobile') {
          const username = user.payload.username.substring(user.payload.username.lastIndexOf('+') +1)
          setUsername(username)
        }
      } catch (err) {
        return history.push('/register')
      }
    }
    getMetaData();
  }, [])


  useEffect(() => {

    ValidatorForm.addValidationRule('isAliasRegistered', async name => {
      const resp = await isAliasRegistered(name);
      return !resp;
    });
  }, []);

  const gotoNext = async () => {
    try {
      const { privateKey, address, publicKey, mnemonic } = wallet.getAccountFromMneomnic();
      const encrytionKey = await i.user.generateEncryptionKey();
      const result = await i.user.encryptKey(
        privateKey,
        encrytionKey.payload.encryptionKey,
        mnemonic,
      );
      const tweb3 = getWeb3();
      tweb3.wallet.importAccount(privateKey);
      tweb3.wallet.defaultAccount = address;
      const registerInfo = [];
      const opts = { address };
      let avatarUrl;
      if (avatarData) {
        const newFile = await applyRotation(avatarData[0], 1, 500);
        const saveFile = imageResize(avatarData[0], newFile);
        const setAva = saveFileToIpfs(saveFile).then(hash => {
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

      dispatch(actionCreate.setStep('two'));
    } catch (err) {
      throw err;
    }
  }

  return (
    <>
      <QueueAnim delay={200} type={['top', 'bottom']}>
        <LayoutAuthen key={1}>
          <BoxAuthen>
            <ShadowBoxAuthen>
              <>
                {step === 'one' && <HeaderAuthen title={<FormattedMessage id="regist.updateInfo" />} />}
                {step === 'one' && <ValidatorForm onSubmit={gotoNext}>
                  <TextValidator
                    label={<FormattedMessage id="regist.displayName" />}
                    fullWidth
                    onChange={event => {
                      // Fix issue #148
                      setDisplayName(event.currentTarget.value.toLowerCase());
                    }}
                    name="displayName"
                    validators={['required']}
                    errorMessages={[
                      <FormattedMessage id="regist.requiredMes" />,
                    ]}
                    margin="dense"
                    value={displayName}
                    inputProps={{ autoComplete: 'displayName' }}
                  />
                  <TextValidator
                    label={<FormattedMessage id="regist.fullName" />}
                    fullWidth
                    onChange={event => {
                      // Fix issue #148
                      setFullName(event.currentTarget.value.toLowerCase());
                    }}
                    name="fullName"
                    validators={['required']}
                    errorMessages={[
                      <FormattedMessage id="regist.requiredMes" />,
                    ]}
                    margin="dense"
                    value={fullName}
                    inputProps={{ autoComplete: 'fullName' }}
                  />
                  <DivControlBtnKeystore justify={'flex-end'}>
                    <ButtonPro type="submit" className="nextBtn">
                      <FormattedMessage id="regist.next" />
                      <Icon className={classes.rightIcon}>arrow_right_alt</Icon>
                    </ButtonPro>
                  </DivControlBtnKeystore>
                </ValidatorForm>}
                {step === 'two' && <RegisterSuccess />}
              </>
            </ShadowBoxAuthen>
          </BoxAuthen>
        </LayoutAuthen>
      </QueueAnim>
    </>
  );
}
