import React, { useEffect, useState } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import Icon from '@material-ui/core/Icon';
import { ValidatorForm, TextValidator } from 'react-material-ui-form-validator';
import Box from '@material-ui/core/Box';
import { useSnackbar } from 'notistack';

import tweb3 from '../../../../service/tweb3';
import { isAliasRegisted, wallet, registerAlias, setTagsInfo, saveToIpfs } from '../../../../helper';
import { ButtonPro, LinkPro } from '../../../elements/Button';
import { AvatarPro } from '../../../elements';
import ImageCrop from '../../../elements/ImageCrop';
import * as actionGlobal from '../../../../store/actions/globalData';
import * as actionAccount from '../../../../store/actions/account';
import * as actionCreate from '../../../../store/actions/create';
import { DivControlBtnKeystore, FlexBox } from '../../../elements/StyledUtils';

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
  },
  avatar: {
    width: 100,
    height: 100,
    margin: theme.spacing(0, 1, 1, 0),
  },
}));

function RegisterUsername(props) {
  const { setStep, setLoading, setAccount } = props;
  const [username, setUsername] = useState('');
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [password, setPassword] = useState('');
  const [rePassword, setRePassword] = useState('');
  const [avatar, setAvatar] = useState('/static/img/no-avatar.jpg');
  const [avatarData, setAvatarData] = useState('');
  const [isOpenCrop, setIsOpenCrop] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const [originFile, setOriginFile] = useState([]);

  useEffect(() => {
    ValidatorForm.addValidationRule('isPasswordMatch', value => {
      if (value !== password) {
        return false;
      }
      return true;
    });

    // Fix issue #148
    ValidatorForm.addValidationRule('specialCharacter', async name => {
      // const regex = new RegExp('^(?=.{3,20}$)(?![_.])(?!.*[_.]{2})[a-z0-9._]+(?<![_.])$');
      const regex = new RegExp('^(?![_.])(?!.*[_.]{2})[a-z0-9._]+(?<![_.])$');
      return regex.test(name);
    });

    ValidatorForm.addValidationRule('isAliasRegisted', async name => {
      const resp = await isAliasRegisted(name);
      return !resp;
    });

    return () => {
      ValidatorForm.removeValidationRule('isPasswordMatch');
      ValidatorForm.removeValidationRule('isAliasRegisted');
    };
  }, [password]);

  async function gotoNext() {
    const isUsernameRegisted = await isAliasRegisted(username);
    if (isUsernameRegisted) {
      const message = 'Username already exists! Please choose another.';
      enqueueSnackbar(message, { variant: 'error' });
    } else {
      setLoading(true);
      setTimeout(async () => {
        try {
          const account = await createAccountWithMneomnic();
          const { privateKey, address, publicKey, mnemonic } = account;
          const displayname = `${firstname} ${lastname}`;

          setAccount({ username, address, privateKey, publicKey, cipher: password, mnemonic });
          tweb3.wallet.importAccount(privateKey);
          tweb3.wallet.defaultAccount = address;

          const resp = await registerAlias(username, address);
          const respTagName = await setTagsInfo(address, 'display-name', displayname);
          const respTagFristname = await setTagsInfo(address, 'firstname', firstname);
          const respTagLastname = await setTagsInfo(address, 'lastname', lastname);
          const respTagPublicKey = await setTagsInfo(address, 'pub-key', publicKey);
          if (avatarData) {
            const hash = await saveToIpfs(avatarData);
            await setTagsInfo(address, 'avatar', hash);
          }

          if (resp && respTagName && respTagPublicKey && respTagFristname && respTagLastname) {
            setStep('two');
          } else {
            const message = 'An error has occured. Please try again.';
            enqueueSnackbar(message, { variant: 'error' });
          }
        } catch (e) {
          const message = `An error has occured. Detail:${e}`;
          enqueueSnackbar(message, { variant: 'error' });
        }
        setLoading(false);
      }, 100);
    }
  }

  function createAccountWithMneomnic() {
    const resp = wallet.createAccountWithMneomnic();
    return {
      privateKey: resp.privateKey,
      address: resp.address,
      mnemonic: resp.mnemonic,
      publicKey: resp.publicKey,
    };
  }

  function gotoLogin() {
    const { history } = props;
    history.push('/login');
  }

  function handleImageChange(event) {
    event.preventDefault();
    const orFiles = event.target.files;

    if (orFiles.length > 0) {
      setOriginFile(orFiles);
      setIsOpenCrop(true);
    } else {
      setIsOpenCrop(false);
    }
  }

  function closeCrop() {
    setIsOpenCrop(false);
  }

  function acceptCrop(e) {
    closeCrop();
    setAvatarData(e.cropFile);
    setAvatar(e.avaPreview);
  }

  const classes = useStyles();
  return (
    <div>
      <ValidatorForm onSubmit={gotoNext}>
        <TextValidator
          label="Username"
          fullWidth
          onChange={event => {
            // Fix issue #148
            setUsername(event.currentTarget.value.toLowerCase());
          }}
          name="username"
          validators={['required', 'specialCharacter', 'isAliasRegisted']}
          errorMessages={[
            'This field is required',
            'Username cannot contain spaces and special character',
            'Username already exists! Please choose another',
          ]}
          margin="dense"
          value={username}
        />
        <FlexBox>
          <TextValidator
            label="First Name"
            fullWidth
            onChange={event => {
              setFirstname(event.currentTarget.value);
            }}
            name="firstname"
            validators={['required']}
            errorMessages={['This field is required']}
            className={classes.marginRight}
            margin="dense"
            value={firstname}
          />
          <TextValidator
            label="Last Name"
            fullWidth
            onChange={event => {
              setLastname(event.currentTarget.value);
            }}
            name="lastname"
            validators={['required']}
            errorMessages={['This field is required']}
            margin="dense"
            value={lastname}
          />
        </FlexBox>
        <TextValidator
          label="Password"
          fullWidth
          onChange={event => {
            setPassword(event.currentTarget.value);
          }}
          name="password"
          type="password"
          validators={['required']}
          errorMessages={['This field is required']}
          margin="dense"
          value={password}
        />
        <TextValidator
          label="Repeat password"
          fullWidth
          onChange={event => {
            setRePassword(event.currentTarget.value);
          }}
          name="rePassword"
          type="password"
          validators={['isPasswordMatch', 'required']}
          errorMessages={['Password mismatch', 'This field is required']}
          margin="dense"
          value={rePassword}
        />
        <Box display="flex" className={classes.avatarBox}>
          <span>Avatar</span>
          <div>
            <AvatarPro src={avatar} className={classes.avatar} />
            <input className="fileInput" type="file" onChange={handleImageChange} accept="image/*" />
          </div>
        </Box>

        <DivControlBtnKeystore>
          <LinkPro onClick={gotoLogin}>Already had an account? Login</LinkPro>
          <ButtonPro type="submit">
            Next
            <Icon className={classes.rightIcon}>arrow_right_alt</Icon>
          </ButtonPro>
        </DivControlBtnKeystore>
      </ValidatorForm>
      {isOpenCrop && <ImageCrop close={closeCrop} accept={acceptCrop} originFile={originFile} />}
    </div>
  );
}

// const mapStateToProps = state => {
//   const e = state.create;
//   return {
//   };
// };

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

export default withRouter(
  connect(
    null,
    mapDispatchToProps
  )(RegisterUsername)
);
