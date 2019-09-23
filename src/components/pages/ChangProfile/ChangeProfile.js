import React, { PureComponent } from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import QueueAnim from 'rc-queue-anim';
import { withStyles } from '@material-ui/core/styles';
import { ValidatorForm, TextValidator } from 'react-material-ui-form-validator';
import Cropper from 'react-cropper';
import { getTagsInfo, setTagsInfo, saveToIpfs } from '../../../helper';
import { ButtonPro } from '../../elements/Button';
import * as actionGlobal from '../../../store/actions/globalData';
import * as actionAccount from '../../../store/actions/account';
import * as actionCreate from '../../../store/actions/create';
import tweb3 from '../../../service/tweb3';
import { DivControlBtnKeystore, FlexBox, LayoutAuthen, BoxAuthen, ShadowBoxAuthen } from '../../elements/StyledUtils';
import { HeaderAuthen } from '../../elements/Common';
import 'cropperjs/dist/cropper.css';

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
  flex-direction: row;
  -webkit-box-pack: justify;
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
    width: 100%;
    height: 25px;
    /* border: 1px solid #eddada8f; */
    padding: 2px;
    margin: 10px;
    cursor: pointer;
  }
  .imgPreview {
    text-align: center;
    height: 200px;
    width: 200px;
    border: 1px solid #eddada8f;
    cursor: pointer;
    img {
      width: 200px;
      height: 200px;
      cursor: pointer;
    }
  }
  .previewText {
    margin-top: 70px;
    cursor: pointer;
    color: #736e6e;
  }
`;

const RightProfile = styled.div`
  margin-left: 8px;
`;

class ChangeProfile extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      firstname: '',
      lastname: '',
      // password: '',
      // rePassword: '',
      file: '',
      imgPreviewUrl: '',
      avatar: '',
      cropFile: '',
    };
  }

  componentDidMount() {
    // ValidatorForm.addValidationRule('isPasswordMatch', value => {
    //   if (value !== this.state.password) {
    //     return false;
    //   }
    //   return true;
    // });
    React.createRef(null);
    this.getData();
  }

  // componentWillUnmount() {
  //   ValidatorForm.removeValidationRule('isPasswordMatch');
  // }

  async getData() {
    const { address } = this.props;
    if (address) {
      const reps = await getTagsInfo(address);
      // console.log('reps', reps);
      const displayName = reps['display-name'];
      const ava = reps.avatar;
      const temp = displayName.split(' ');
      const first = temp.slice(0, 1).join(' ');
      const second = temp.slice(1).join(' ');
      this.setState({
        firstname: first,
        lastname: second,
        avatar: ava,
      });
    }
  }

  saveChange = async () => {
    const { firstname, lastname, password, file, avatar, cropFile } = this.state;
    const { setLoading, setAccount, history, address, privateKey, setNeedAuth } = this.props;
    if (!privateKey) {
      setNeedAuth(true);
    } else {
      setLoading(true);
      setTimeout(async () => {
        const displayName = `${firstname} ${lastname}`;

        tweb3.wallet.importAccount(privateKey);
        tweb3.wallet.defaultAccount = address;

        let respAvatar;
        const respTagName = await setTagsInfo(address, 'display-name', displayName);
        if (cropFile) {
          const hash = await saveToIpfs(cropFile);
          respAvatar = await setTagsInfo(address, 'avatar', hash);
          setAccount({ address, cipher: password, displayName, avatar: hash });
        } else {
          respAvatar = await setTagsInfo(address, 'avatar', avatar);
          setAccount({ address, cipher: password, displayName, avatar });
        }

        if (respTagName && respAvatar) {
          history.push('/');
        } else {
          // notifi.info('Error registerAlias');
        }
        setLoading(false);
      }, 500);
    }
  };

  handleUsername = event => {
    const key = event.currentTarget.name;
    const { value } = event.currentTarget;
    // console.log(event.currentTarget.id);

    this.setState({ [key]: value });
  };

  handleImageChange = event => {
    event.preventDefault();
    const reader = new FileReader();
    const { files } = event.target;
    const file = files[0];

    if (file && file.type.match('image.*')) {
      reader.onloadend = e => {
        this.setState({
          avatar: '',
          file: files,
          imgPreviewUrl: reader.result,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  crop = async e => {
    // image in dataUrl
    const dataUrl = this.refs.cropper.getCroppedCanvas().toDataURL();
    const file = this.state;
    const { name, type } = file.file[0];
    const list = new DataTransfer();
    await fetch(dataUrl)
      .then(res => res.blob())
      .then(blob => {
        const parseFile = new File([blob], name, { type });
        list.items.add(parseFile);
      });
    this.setState({
      cropFile: list.files,
    });
  };

  render() {
    const { firstname, lastname, imgPreviewUrl, avatar } = this.state;
    const { classes } = this.props;

    // console.log('view file', this.state);

    let $imagePreview = null;
    // if (imgPreviewUrl) {
    //   $imagePreview = <img src={imgPreviewUrl} alt="img" />;
    // } else {
    //   $imagePreview = <div className="previewText">Your avatar</div>;
    // }

    // if (avatar) {
    //   $imagePreview = (
    //     <div className="imgPreview">
    //       <img src={process.env.REACT_APP_IPFS + avatar} alt="imgPreview" />
    //     </div>
    //   );
    // }
    if (imgPreviewUrl) {
      $imagePreview = (
        <Cropper
          ref="cropper"
          src={imgPreviewUrl}
          style={{ height: 200, width: 200 }}
          // Cropper.js options
          aspectRatio={1}
          guides={false}
          crop={this.crop}
          viewMode={3}
          autoCrop
        />
      );
    } else {
      $imagePreview = (
        <div className="imgPreview">
          <img src="/static/img/no-avatar.jpg" alt="imgPreview" />
        </div>
      );
    }

    return (
      <QueueAnim delay={200} type={['top', 'bottom']}>
        <LayoutAuthen key={1}>
          <BoxAuthen>
            <ShadowBoxAuthen>
              <HeaderAuthen title="Change Profile" />
              <ValidatorForm onSubmit={this.saveChange}>
                <FlexBox>
                  <PreviewContainter>
                    <div className="upload_img">
                      {avatar ? (
                        <div className="imgPreview">
                          <img src={process.env.REACT_APP_IPFS + avatar} alt="imgPreview" />
                        </div>
                      ) : (
                        $imagePreview
                      )}
                      <input className="fileInput" type="file" onChange={this.handleImageChange} accept="image/*" />
                    </div>
                  </PreviewContainter>
                  <RightProfile>
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
                  </RightProfile>
                </FlexBox>
                {/* <TextValidator
                  label="New Password"
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
                  label="Repeat new password"
                  fullWidth
                  onChange={this.handleUsername}
                  name="rePassword"
                  type="password"
                  validators={['isPasswordMatch', 'required']}
                  errorMessages={['Password mismatch', 'This field is required']}
                  margin="normal"
                  value={rePassword}
                /> */}
                {/* <Cropper
                  ref="cropper"
                  src={imgPreviewUrl}
                  style={{ height: 200, width: '100%' }}
                  // Cropper.js options
                  aspectRatio={9 / 9}
                  guides={false}
                  crop={this.crop}
                  viewMode={3}
                  autoCrop
                /> */}
                <DivControlBtnKeystore>
                  <ButtonPro type="submit">Save change</ButtonPro>
                </DivControlBtnKeystore>
              </ValidatorForm>
            </ShadowBoxAuthen>
          </BoxAuthen>
        </LayoutAuthen>
      </QueueAnim>
    );
  }
}

const mapStateToProps = state => {
  const e = state.create;
  const { account } = state;
  return {
    password: e.password,
    address: account.address,
    privateKey: account.privateKey,
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
    setNeedAuth: value => {
      dispatch(actionAccount.setNeedAuth(value));
    },
  };
};

export default withStyles(styles)(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(ChangeProfile)
);
