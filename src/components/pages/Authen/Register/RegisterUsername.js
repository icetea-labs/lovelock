import React, { PureComponent } from 'react';
import styled from 'styled-components';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import Icon from '@material-ui/core/Icon';
import { ValidatorForm, TextValidator } from 'react-material-ui-form-validator';
import { isAliasRegisted, wallet, registerAlias, setTagsInfo, saveToIpfs } from '../../../../helper';
import { ButtonPro, LinkPro } from '../../../elements/Button';
import * as actionGlobal from '../../../../store/actions/globalData';
import * as actionAccount from '../../../../store/actions/account';
import * as actionCreate from '../../../../store/actions/create';
import tweb3 from '../../../../service/tweb3';
import { DivControlBtnKeystore, FlexBox } from '../../../elements/StyledUtils';

const styles = theme => ({
  rightIcon: {
    marginLeft: theme.spacing(1),
  },
  marginRight: {
    marginRight: theme.spacing(1),
    paddingRight: theme.spacing(1),
  },
});

const PreviewContainter = styled.div`
  display: flex;
  /* flex-direction: row; */
  /* -webkit-box-pack: justify; */
  /* justify-content: space-between; */
  padding: 20px 0 0 0;
  font-size: 14px;
  cursor: pointer;
  /* .upload_img input[type='file'] {
    font-size: 100px;
    position: absolute;
    left: 10;
    top: 0;
    opacity: 0;
    cursor: pointer;
  } */
  .upload_img {
    position: relative;
    overflow: hidden;
    display: inline-block;
    cursor: pointer;
  }
  .fileInput {
    width: 200px;
    height: 30px;
    border: 1px solid #eddada8f;
    padding: 2px;
    margin: 10px;
    cursor: pointer;
    /* :hover {
      background: red;
    } */
  }
  .imgPreview {
    text-align: center;
    margin-right: 15px;
    height: 100px;
    width: 100px;
    border: 1px solid #eddada8f;
    border-radius: 50%;
    cursor: pointer;
    /* :hover {
      background: red;
    } */
    img {
      width: 100%;
      height: 100%;
      cursor: pointer;
      border-radius: 50%;
    }
  }
  .previewAvaDefault {
    width: 50px;
    height: 50px;
    cursor: pointer;
    color: #736e6e;
  }
`;

class RegisterUsername extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      usernameErr: '',
      firstname: '',
      firstnameErr: '',
      lastname: '',
      lastnameErr: '',
      password: '',
      passwordErr: '',
      rePassword: '',
      rePassErr: '',
      file: '',
      imgPreviewUrl: '',
    };
  }
  componentDidMount() {
    ValidatorForm.addValidationRule('isPasswordMatch', value => {
      if (value !== this.state.password) {
        return false;
      }
      return true;
    });

    ValidatorForm.addValidationRule('isAliasRegisted', async username => {
      const resp = await isAliasRegisted(username);
      // console.log('isAliasRegisted', !!resp);
      return !resp;
    });
  }
  componentWillUnmount() {
    // remove rule when it is not needed
    ValidatorForm.removeValidationRule('isPasswordMatch');
    ValidatorForm.removeValidationRule('isAliasRegisted');
  }

  gotoNext = async () => {
    const { username, firstname, lastname, password, file } = this.state;
    const { setStep, setLoading, setAccount } = this.props;

    if (username) {
      const resp = await isAliasRegisted(username);
      if (resp) {
        this.setState({
          usernameErr: 'Username already exists! Please choose another',
        });
      } else {
        setLoading(true);
        setTimeout(async () => {
          const account = await this._createAccountWithMneomnic();
          const { privateKey, address, publicKey, mnemonic } = account;
          const displayname = firstname + ' ' + lastname;
          // console.log('publicKey', publicKey);
          setAccount({ username, address, privateKey, publicKey, cipher: password, mnemonic });
          tweb3.wallet.importAccount(privateKey);
          tweb3.wallet.defaultAccount = address;

          const resp = await registerAlias(username, address, privateKey);
          // console.log('resp', resp);
          const respTagName = await setTagsInfo(address, 'display-name', displayname);
          const respTagPublicKey = await setTagsInfo(address, 'pub-key', publicKey);
          if (file) {
            const hash = await saveToIpfs(file);
            const respAvatar = await setTagsInfo(address, 'avatar', hash);
          }
          // console.log('respTags', respTagName);

          if (resp && respTagName && respTagPublicKey) {
            setStep('two');
          } else {
            // notifi.info('Error registerAlias');
          }
          setLoading(false);
        }, 500);
      }
    }
  };

  handleUsername = event => {
    const key = event.currentTarget.name;
    const value = event.currentTarget.value;
    console.log(event.currentTarget.id);

    this.setState({ [key]: value });
  };

  _createAccountWithMneomnic = () => {
    const resp = wallet.createAccountWithMneomnic();
    // const keyObject = encode(resp.privateKey, 'a');
    return {
      privateKey: resp.privateKey,
      address: resp.address,
      mnemonic: resp.mnemonic,
      publicKey: resp.publicKey,
    };
  };

  handleImageChange = e => {
    e.preventDefault();

    const reader = new FileReader();
    const { files } = e.target;
    const file = files[0];

    reader.onloadend = () => {
      if (files) {
        this.setState({
          file: files,
          imgPreviewUrl: reader.result,
        });
      }
    };

    if (file && file.type.match('image.*')) {
      reader.readAsDataURL(file);
    }
  };

  gotoLogin = () => {
    const { history } = this.props;
    history.push('/login');
  };

  render() {
    const { username, firstname, lastname, password, rePassword, imgPreviewUrl } = this.state;
    const { classes } = this.props;

    // console.log('view file', this.state.file);

    let $imagePreview = null;
    if (imgPreviewUrl) {
      $imagePreview = <img src={imgPreviewUrl} alt="imgPreview" />;
    } else {
      $imagePreview = <img src="/static/img/no-avatar.jpg" alt="avaDefault" className="previewAvaDefault" />;
    }

    return (
      <ValidatorForm onSubmit={this.gotoNext}>
        <TextValidator
          label="Username"
          fullWidth
          onChange={this.handleUsername}
          name="username"
          validators={['required', 'isAliasRegisted']}
          errorMessages={['This field is required', 'Username already exists! Please choose another']}
          margin="normal"
          value={username}
        />
        <FlexBox>
          <TextValidator
            label="First Name"
            fullWidth
            onChange={this.handleUsername}
            name="firstname"
            validators={['required']}
            errorMessages={['This field is required']}
            className={classes.marginRight}
            margin="normal"
            value={firstname}
          />
          <TextValidator
            label="Last Name"
            fullWidth
            onChange={this.handleUsername}
            name="lastname"
            validators={['required']}
            errorMessages={['This field is required']}
            margin="normal"
            value={lastname}
          />
        </FlexBox>
        <TextValidator
          label="Password"
          fullWidth
          onChange={this.handleUsername}
          name="password"
          type="password"
          validators={['required']}
          errorMessages={['This field is required']}
          margin="normal"
          value={password}
        />
        <TextValidator
          label="Repeat password"
          fullWidth
          onChange={this.handleUsername}
          name="rePassword"
          type="password"
          validators={['isPasswordMatch', 'required']}
          errorMessages={['Password mismatch', 'This field is required']}
          margin="normal"
          value={rePassword}
        />
        <PreviewContainter>
          <span>Avatar</span>
          <div className="upload_img">
            <div className="imgPreview">{$imagePreview}</div>
            <input className="fileInput" type="file" onChange={this.handleImageChange} />
          </div>
        </PreviewContainter>
        <DivControlBtnKeystore>
          <LinkPro onClick={this.gotoLogin}>Already had an account? Login</LinkPro>
          <ButtonPro type="submit">
            Next
            <Icon className={classes.rightIcon}>arrow_right_alt</Icon>
          </ButtonPro>
        </DivControlBtnKeystore>
      </ValidatorForm>
    );
  }
}

const mapStateToProps = state => {
  const e = state.create;
  return {
    password: e.password,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    // setPassword: value => {
    //   dispatch(actions.setPassword(value));
    // },
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
    mapStateToProps,
    mapDispatchToProps
  )(withStyles(styles)(RegisterUsername))
);
