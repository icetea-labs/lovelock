import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import QueueAnim from 'rc-queue-anim';
import { ecc } from '@iceteachain/common';
import { makeStyles } from '@material-ui/core/styles';
import { ValidatorForm, TextValidator } from 'react-material-ui-form-validator';
import { useSnackbar } from 'notistack';
import CameraAltIcon from '@material-ui/icons/CameraAlt';

import { getAliasAndTags, setTagsInfo, saveFileToIpfs, isAliasRegistered, registerAlias } from '../../../helper';
import { ButtonPro } from '../../elements/Button';
import * as actionGlobal from '../../../store/actions/globalData';
import * as actionAccount from '../../../store/actions/account';
import * as actionCreate from '../../../store/actions/create';
import { DivControlBtnKeystore, FlexBox, LayoutAuthen, BoxAuthen, ShadowBoxAuthen } from '../../elements/StyledUtils';
import { HeaderAuthen } from '../../elements/Common';
import { AvatarPro } from '../../elements';
import ImageCrop from '../../elements/ImageCrop';
import RotationImg from '../../elements/RotationImg';

const useStyles = makeStyles(() => ({
  avatar: {
    width: 120,
    height: 120,
  },
}));

const BoxAuthenCus = styled(BoxAuthen)`
  top: 30px;
`;

const RotateImage = styled.div`
  input {
    border-radius: 4px;
    border: none;
    cursor: pointer;
    background: linear-gradient(332deg, #b276ff, #fe8dc3);
    color: #fff;
  }
  .rightRotate {
    float: right;
  }
`;

const PreviewContainter = styled.div`
  display: block;
  flex-direction: row;
  -webkit-box-pack: justify;
  padding: 20px 0 0 0;
  font-size: 14px;
  cursor: pointer;
  .upload_img input[type='file'] {
    font-size: 100px;
    position: absolute;
    left: 0;
    top: 0;
    opacity: 0;
    cursor: pointer;
  }
  .upload_img {
    height: 120px;
    position: relative;
    overflow: hidden;
    display: inline-block;
    cursor: pointer;
    &:hover .changeImg {
      display: block;
    }
  }

  .changeImg {
    cursor: pointer;
    position: absolute;
    display: none;
    height: 60px;
    bottom: 0;
    top: 60px;
    left: 0;
    right: 0;
    text-align: center;
    background-color: rgba(0, 0, 0, 0.5);
    color: #fff;
    font-size: 80%;
    line-height: 2;
    overflow: hidden;
    border-bottom-left-radius: 600px;
    border-bottom-right-radius: 600px;
  }
  .fileInput {
    width: 100px;
    height: 50px;
    padding: 2px;
    margin: 10px;
    cursor: pointer;
  }
`;

const RightProfile = styled.div`
  padding: 10px;
  margin: 5px;
`;

function ChangeProfile(props) {
  const { setLoading, setAccount, history, address, tokenAddress, tokenKey, setNeedAuth, privateKey } = props;
  const [firstname, setFirstname] = useState({ old: '', new: '' });
  const [lastname, setLastname] = useState({ old: '', new: '' });
  const [avatar, setAvatar] = useState('');
  const [cropFile, setCropFile] = useState('');
  const [username, setUsername] = useState('');
  const [isRegistered, setIsRegistered] = useState(true);
  const [isOpenCrop, setIsOpenCrop] = useState(false);
  const [originFile, setOriginFile] = useState([]);
  const { enqueueSnackbar } = useSnackbar();
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    async function getData() {
      const [alias, tags] = await getAliasAndTags(address);
      if (alias) {
        setIsRegistered(true);
        setUsername(alias);
      } else {
        setIsRegistered(false);
      }

      if (tags) {
        setFirstname({ old: tags.firstname || '', new: tags.firstname || '' });
        setLastname({ old: tags.lastname || '', new: tags.lastname || '' });
        setAvatar(tags.avatar);
      }
    }

    getData();
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

    return () => {
      ValidatorForm.removeValidationRule('isPasswordMatch');
      ValidatorForm.removeValidationRule('isAliasRegistered');
    };
  }, [address]);

  const applyRotation = (file, orientation) =>
    new Promise(resolve => {
      const maxWidth = 250;
      const reader = new FileReader();

      reader.onload = () => {
        const url = reader.result;

        const image = new Image();

        image.onload = () => {
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');

          let { width, height } = image;

          const [outputWidth, outputHeight] = orientation >= 5 && orientation <= 8 ? [height, width] : [width, height];

          const scale = outputWidth > maxWidth ? maxWidth / outputWidth : 1;

          width *= scale;
          height *= scale;

          // set proper canvas dimensions before transform & export
          canvas.width = outputWidth * scale;
          canvas.height = outputHeight * scale;

          // transform context before drawing image
          switch (orientation) {
            case 3:
              context.transform(-1, 0, 0, -1, width, height);
              break;
            case 6:
              context.transform(0, -1, 1, 0, 0, width);
              break;
            case 8:
              context.transform(0, 1, -1, 0, height, 0);
              break;
            default:
              break;
          }

          // draw image
          context.drawImage(image, 0, 0, width, height);

          // export base64
          resolve(canvas.toDataURL('image/jpeg'));
        };

        image.src = url;
      };

      reader.readAsDataURL(file);
    });

  async function saveChange() {
    if (isRegistered ? !tokenKey : !privateKey) {
      setNeedAuth(true);
    } else {
      setLoading(true);
      setTimeout(async () => {
        try {
          const tags = {};
          if (firstname.old !== firstname.new) {
            tags.firstname = firstname.new;
          }

          if (lastname.old !== lastname.new) {
            tags.lastname = lastname.new;
          }

          const displayName = `${firstname.new} ${lastname.new}`;
          if (firstname.old !== firstname.new || lastname.old !== lastname.new) {
            tags['display-name'] = displayName;
          }

          const listSetTags = [];
          const accountInfo = { displayName };
          let orient = 1;
          if (rotation === 180 || rotation === -180) {
            orient = 3;
          } else if (rotation === 270 || rotation === -90) {
            orient = 6;
          } else if (rotation === 90 || rotation === -270) {
            orient = 8;
          }
          if (cropFile) {
            const newFile = await applyRotation(cropFile[0], orient);
            const { name, type } = cropFile[0];
            const byteString = atob(newFile.split(',')[1]);
            const ab = new ArrayBuffer(byteString.length);
            const ia = new Uint8Array(ab);
            for (let i = 0; i < byteString.length; i++) {
              ia[i] = byteString.charCodeAt(i);
            }
            const blob = new Blob([ia], { type });
            const parseFile = new File([blob], name, { type });
            const saveFile = [parseFile];

            // console.log('saveFile', saveFile);
            const saveAvatar = saveFileToIpfs(saveFile).then(hash => {
              accountInfo.avatar = hash;
              if (avatar !== hash) {
                return setTagsInfo({ avatar: hash }, { address, tokenAddress });
              }
            });
            listSetTags.push(saveAvatar);
          }

          if (!isRegistered) {
            if (privateKey) {
              const { publicKey } = ecc.toPubKeyAndAddress(privateKey);
              tags['pub-key'] = publicKey;
              listSetTags.push(registerAlias(username, address));
            } else {
              const message = 'Please login or Input recovery phrase';
              enqueueSnackbar(message, { variant: 'error' });
              history.push('/login');
            }
          }

          listSetTags.push(setTagsInfo(tags, { address, tokenAddress }));
          const change = await Promise.all(listSetTags);
          if (change) {
            // Set to redux
            setAccount(accountInfo);
            // Show message infor
            const message = 'Change profile success!';
            enqueueSnackbar(message, { variant: 'success' });
            history.push('/');
          }
        } catch (error) {
          console.error(error);
          const message = `An error occurred, please try again later`;
          enqueueSnackbar(message, { variant: 'error' });
        }
        setLoading(false);
      }, 100);
    }
  }

  function handleImageChange(event) {
    event.preventDefault();
    const orFiles = Array.from(event.target.files);

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
    setCropFile(e.cropFile);
    // setAvatar(e.avaPreview);
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatar(reader.result);
    };
    reader.readAsDataURL(e.cropFile[0]);
  }

  function rotateRight() {
    let newRotation = rotation + 90;
    if (newRotation >= 360) {
      newRotation = 0;
    }
    setRotation(newRotation);
  }

  function rotateleft() {
    let newRotation = rotation - 90;
    if (newRotation <= -360) {
      newRotation = 0;
    }
    setRotation(newRotation);
  }

  // console.log('avaPreview', avatar);
  // console.log('avatar', avatar);

  const classes = useStyles();

  return (
    <>
      <QueueAnim delay={200} type={['top', 'bottom']}>
        <LayoutAuthen key={1}>
          <BoxAuthenCus>
            <ShadowBoxAuthen>
              <HeaderAuthen title="Change Profile" />
              <ValidatorForm onSubmit={saveChange}>
                <FlexBox>
                  <PreviewContainter>
                    <div className="upload_img">
                      {cropFile ? (
                        // <AvatarPro src={avatar} className={classes.avatar} />
                        <RotationImg src={avatar} rotation={rotation} />
                      ) : (
                        <AvatarPro hash={avatar} className={classes.avatar} />
                      )}
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
                    {cropFile && (
                      <RotateImage>
                        <input onClick={rotateleft} type="button" value="left" className="leftRotate" />
                        <input onClick={rotateRight} type="button" value="right" className="rightRotate" />
                      </RotateImage>
                    )}
                  </PreviewContainter>
                  <RightProfile>
                    <TextValidator
                      label="Username"
                      fullWidth
                      onChange={event => {
                        // Fix issue #148
                        setUsername(event.currentTarget.value.toLowerCase());
                      }}
                      name="username"
                      validators={
                        isRegistered
                          ? ['required', 'specialCharacter']
                          : ['required', 'specialCharacter', 'isAliasRegistered']
                      }
                      errorMessages={[
                        'This field is required.',
                        'Username cannot contain spaces and special character.',
                        'This username is already taken.',
                      ]}
                      margin="dense"
                      value={username}
                      disabled={isRegistered}
                    />
                    <TextValidator
                      label="First Name"
                      fullWidth
                      onChange={event => setFirstname({ ...firstname, new: event.currentTarget.value })}
                      name="firstname"
                      validators={['required']}
                      errorMessages={['This field is required']}
                      margin="normal"
                      value={firstname.new}
                    />
                    <TextValidator
                      label="Last Name"
                      fullWidth
                      onChange={event => setLastname({ ...lastname, new: event.currentTarget.value })}
                      name="lastname"
                      validators={['required']}
                      errorMessages={['This field is required']}
                      margin="normal"
                      value={lastname.new}
                    />
                  </RightProfile>
                </FlexBox>
                <DivControlBtnKeystore justify="center">
                  <ButtonPro type="submit">Save change</ButtonPro>
                </DivControlBtnKeystore>
              </ValidatorForm>
            </ShadowBoxAuthen>
          </BoxAuthenCus>
        </LayoutAuthen>
      </QueueAnim>
      {isOpenCrop && <ImageCrop close={closeCrop} accept={acceptCrop} originFile={originFile} />}
    </>
  );
}

const mapStateToProps = state => {
  return {
    address: state.account.address,
    privateKey: state.account.privateKey,
    tokenKey: state.account.tokenKey,
    tokenAddress: state.account.tokenAddress,
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

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ChangeProfile);
