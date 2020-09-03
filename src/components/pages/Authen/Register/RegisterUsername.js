import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import Icon from '@material-ui/core/Icon';
// import CameraAltIcon from '@material-ui/icons/CameraAlt';
import { ValidatorForm, TextValidator } from 'react-material-ui-form-validator';
// import Box from '@material-ui/core/Box';
import { useSnackbar } from 'notistack';
import SnackbarContent from '@material-ui/core/SnackbarContent';
import WarningIcon from '@material-ui/icons/Warning';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import { FormattedMessage } from 'react-intl';

import CheckBoxIcon from '@material-ui/icons/CheckBox';

import getWeb3 from '../../../../service/tweb3';
import {
  isAliasRegistered,
  wallet,
  registerAlias,
  setTagsInfo,
  saveFileToIpfs,
  applyRotation,
  imageResize,
  generateEncryptionKey,
  encrypt,
  axios,
  awsEncrypt,
} from '../../../../helper';
import { ButtonPro, LinkPro } from '../../../elements/Button';
// import { AvatarPro } from '../../../elements';
// import ImageCrop from '../../../elements/ImageCrop';
import * as actionGlobal from '../../../../store/actions/globalData';
import * as actionAccount from '../../../../store/actions/account';
import * as actionCreate from '../../../../store/actions/create';
import { DivControlBtnKeystore, FlexBox } from '../../../elements/StyledUtils';
import { useRemember } from '../../../../helper/hooks';

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

// const PreviewContainter = styled.div`
//   display: flex;
//   flex-direction: row;
//   -webkit-box-pack: justify;
//   font-size: 14px;
//   cursor: pointer;
//   .upload_img input[type='file'] {
//     font-size: 100px;
//     position: absolute;
//     left: 0;
//     top: 0;
//     opacity: 0;
//     cursor: pointer;
//   }
//   .upload_img {
//     position: relative;
//     overflow: hidden;
//     display: inline-block;
//     cursor: pointer;
//     &:hover .changeImg {
//       display: block;
//     }
//   }
//   .changeImg {
//     cursor: pointer;
//     position: absolute;
//     display: none;
//     width: 100px;
//     height: 50px;
//     top: 50px;
//     left: 0;
//     right: 0;
//     text-align: center;
//     background-color: rgba(0, 0, 0, 0.5);
//     color: #fff;
//     font-size: 80%;
//     line-height: 2;
//     overflow: hidden;
//     border-bottom-left-radius: 600px;
//     border-bottom-right-radius: 600px;
//   }
//   .fileInput {
//     width: 120px;
//     height: 50px;
//     padding: 2px;
//     cursor: pointer;
//   }
// `;

const WarningPass = styled.div`
  .warningSnackbar {
    background-color: #fe7;
    box-shadow: none;
    margin-top: 8px;
    max-width: 400px;
  }
  .warningMessage {
    display: flex;
    alignitems: center;
  }
  .warningIcon {
    margin-right: 16px;
    color: #d90;
  }
  .warningText {
    color: #333;
    font-style: italic;
    font-size: 1.1em;
  }
`;

function RegisterUsername(props) {
  const {
    setStep,
    setLoading,
    setAccount,
    setIsRemember,
    /* setIsOpenCrop, setOriginFile, avatar, */ avatarData,
  } = props;
  const [username, setUsername] = useState('');
  const [displayName, setDisplayname] = useState('');
  const [kmsCredentials, setKmsCredentials] = useState(null);
  // const [password, setPassword] = useState('');
  // const [rePassword, setRePassword] = useState('');
  // const [avatar, setAvatar] = useState('/static/img/no-avatar.jpg');
  // const [avatarData, setAvatarData] = useState('');
  // const [isOpenCrop, setIsOpenCrop] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  // const [originFile, setOriginFile] = useState([]);
  const [isRememberState, setIsRememberState] = useRemember();

  useEffect(() => {
    // ValidatorForm.addValidationRule('isPasswordMatch', value => {
    //   if (value !== password) {
    //     return false;
    //   }
    //   return true;
    // });

    // Fix issue #148
    ValidatorForm.addValidationRule('specialCharacter', async name => {
      // const regex = new RegExp('^(?=.{3,20}$)(?![_.])(?!.*[_.]{2})[a-z0-9._]+(?<![_.])$');
      const regex = new RegExp('^(?![_.])(?!.*[_.]{2})[a-z0-9._]+[a-z0-9]$');
      return regex.test(name);
    });

    ValidatorForm.addValidationRule('isAliasRegistered', async name => {
      const resp = await isAliasRegistered(name);
      return !resp;
    });
    const getInfo = async () => {
      try {
        const info = await axios.get('/key/getCredentials')
        console.log(info)
        if (info.data) {
          setUsername(info.data.user.username.split('@')[0]);
          setDisplayname(info.data.user.display_name);
          setKmsCredentials(info.data.credentials);
        }
      } catch (err) {
        if (err && err.response.status === 401) {
          window.location = '/registerIceteaId'
        }
      }
    }
    getInfo();
    return () => {
      // ValidatorForm.removeValidationRule('isPasswordMatch');
      ValidatorForm.removeValidationRule('isAliasRegistered');
    };
  }, []);

  async function gotoNext() {
    const isUsernameRegisted = await isAliasRegistered(username);
    if (isUsernameRegisted) {
      const message = 'This username is already taken.';
      enqueueSnackbar(message, { variant: 'error' });
    } else {
      setLoading(true);
      setTimeout(async () => {
        try {
          const account = await createAccountWithMneomnic();
          const { privateKey, address, publicKey, mnemonic } = account;
          const encryptionKey = generateEncryptionKey();
          const encryptedPrivateKey = encrypt(privateKey, encryptionKey);
          const encryptedEncryptionKey = await awsEncrypt({...kmsCredentials, plainText: encryptionKey})
          const saveKey = await axios.post('/key/save', {
            encryptionKey: encryptedEncryptionKey,
            privateKey: encryptedPrivateKey
          })
          setAccount({ username, address, privateKey, publicKey, mnemonic });
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
                // firstname,
                // lastname,
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
            // cipher: password,
            publicKey,
            mnemonic,
          };
          setAccount(newAccount);
          setLoading(false);
          setStep('two');
          setIsRemember(isRememberState);

          // REMARK:
          // No matter we explicitly store or not, Chrome ALWAYS shows a popup
          // offering user to save password. It is the user who decides.
          // The following code just adds extra info (display name, avatar)
          // if user opt to save.
          // This extra data makes the 'select account' popup looks better
          // when we get password later in non-silent mode

          // save to browser password manager
          if (window.PasswordCredential) {
            const credData = { id: username, name: displayName };
            if (avatarUrl) {
              credData.iconURL = avatarUrl;
            }
            const cred = new window.PasswordCredential(credData);

            // If error, just warn to console because this feature is not essential
            navigator.credentials.store(cred).catch(console.warn);
          }
        } catch (error) {
          console.error(error);
          const message = `An error has occured. Detail:${error}`;
          enqueueSnackbar(message, { variant: 'error' });
          setLoading(false);
        }
      }, 100);
    }
  }

  function createAccountWithMneomnic() {
    const { mnemonic, privateKey, publicKey, address } = wallet.getAccountFromMneomnic();
    return { mnemonic, privateKey, publicKey, address };
  }

  function gotoLogin() {
    const { history } = props;
    history.push('/login');
  }

  // function handleImageChange(event) {
  //   event.preventDefault();
  //   const orFiles = Array.from(event.target.files);

  //   if (orFiles.length > 0) {
  //     setOriginFile(orFiles);
  //     setIsOpenCrop(true);
  //   } else {
  //     setIsOpenCrop(false);
  //   }
  // }

  // function closeCrop() {
  //   setIsOpenCrop(false);
  // }

  // function acceptCrop(e) {
  //   closeCrop();
  //   setAvatarData(e.cropFile);
  //   setAvatar(e.avaPreview);
  // }

  const classes = useStyles();
  return (
    <>
      <ValidatorForm onSubmit={gotoNext}>
        <TextValidator
          label={<FormattedMessage id="regist.userName" />}
          fullWidth
          onChange={event => {
            // Fix issue #148
            setUsername(event.currentTarget.value.toLowerCase());
          }}
          name="username"
          validators={['required', 'specialCharacter', 'isAliasRegistered']}
          errorMessages={[
            <FormattedMessage id="regist.requiredMes" />,
            <FormattedMessage id="regist.characterCheck" />,
            <FormattedMessage id="regist.userTaken" />,
          ]}
          margin="dense"
          value={username}
          inputProps={{ autoComplete: 'username' }}
        />
        <TextValidator
          label={<FormattedMessage id="regist.displayName" />}
          fullWidth
          onChange={event => {
            setDisplayname(event.currentTarget.value);
          }}
          name="displayname"
          validators={['required']}
          errorMessages={[<FormattedMessage id="regist.requireDisplayname" />]}
          margin="dense"
          value={displayName}
        />
        {/* <TextValidator
          label={<FormattedMessage id="regist.password" />}
          fullWidth
          onChange={event => {
            setPassword(event.currentTarget.value);
          }}
          name="password"
          type="password"
          validators={['required']}
          errorMessages={[<FormattedMessage id="regist.requiredMes" />]}
          margin="dense"
          value={password}
          inputProps={{ autoComplete: 'new-password' }}
        />
        <TextValidator
          label={<FormattedMessage id="regist.rePassword" />}
          fullWidth
          onChange={event => {
            setRePassword(event.currentTarget.value);
          }}
          name="rePassword"
          type="password"
          validators={['isPasswordMatch', 'required']}
          errorMessages={[<FormattedMessage id="regist.passMismatch" />, <FormattedMessage id="regist.requiredMes" />]}
          margin="dense"
          value={rePassword}
          inputProps={{ autoComplete: 'new-password' }}
        /> */}
        {/* <Box display="flex" className={classes.avatarBox}>
          <span>Avatar</span>
          <PreviewContainter>
            <div className="upload_img">
              <AvatarPro src={avatar} className={classes.avatar} />
              <div className="changeImg">
                <input
                  className="fileInput"
                  type="file"
                  value=""
                  onChange={handleImageChange}
                  accept="image/jpeg,image/png"
                />
                <CameraAltIcon />
              </div>
            </div>
          </PreviewContainter>
        </Box> */}
        <div>
          <FormControlLabel
            control={
              <Checkbox
                icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                checkedIcon={<CheckBoxIcon fontSize="small" />}
                value={isRememberState}
                checked={isRememberState}
                color="primary"
                onChange={() => setIsRememberState(!isRememberState)}
              />
            }
            label={<FormattedMessage id="regist.rememberMe" />}
          />
        </div>
        <WarningPass>
          <SnackbarContent
            className="warningSnackbar"
            message={
              <span className="warningMessage">
                <WarningIcon className="warningIcon" />
                <span className="warningText">
                  <FormattedMessage id="regist.warningText" />
                </span>
              </span>
            }
          />
        </WarningPass>

        <DivControlBtnKeystore>
          <div>
            <span>
              <FormattedMessage id="regist.alreadyAcc" />
            </span>
            <LinkPro className="alreadyAcc" onClick={gotoLogin}>
              <FormattedMessage id="regist.login" />
            </LinkPro>
          </div>
          <ButtonPro type="submit" className="nextBtn">
            <FormattedMessage id="regist.next" />
            <Icon className={classes.rightIcon}>arrow_right_alt</Icon>
          </ButtonPro>
        </DivControlBtnKeystore>
      </ValidatorForm>
      {/* {isOpenCrop && <ImageCrop close={closeCrop} accept={acceptCrop} originFile={originFile} />} */}
    </>
  );
}

const mapStateToProps = state => {
  return {
    isRemember: state.create.isRemember,
  };
};

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
    setIsRemember: value => {
      window.localStorage['remember'] = value ? '1' : '0';
      dispatch(actionCreate.setIsRemember(value));
    },
  };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(RegisterUsername));
