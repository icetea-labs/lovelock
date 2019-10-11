import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import QueueAnim from 'rc-queue-anim';
import { makeStyles } from '@material-ui/core/styles';
import { ValidatorForm, TextValidator } from 'react-material-ui-form-validator';
import { useSnackbar } from 'notistack';
import CameraAltIcon from '@material-ui/icons/CameraAlt';

import { getTagsInfo, setTagsInfo, saveFileToIpfs } from '../../../helper';
import { ButtonPro } from '../../elements/Button';
import * as actionGlobal from '../../../store/actions/globalData';
import * as actionAccount from '../../../store/actions/account';
import * as actionCreate from '../../../store/actions/create';
import { DivControlBtnKeystore, FlexBox, LayoutAuthen, BoxAuthen, ShadowBoxAuthen } from '../../elements/StyledUtils';
import { HeaderAuthen } from '../../elements/Common';
import { AvatarPro } from '../../elements';
import ImageCrop from '../../elements/ImageCrop';

const useStyles = makeStyles(() => ({
  avatar: {
    width: 120,
    height: 120,
  },
}));

const BoxAuthenCus = styled(BoxAuthen)`
  top: 30px;
`;

const PreviewContainter = styled.div`
  display: flex;
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
`;

const RightProfile = styled.div`
  margin-left: 8px;
`;

function ChangeProfile(props) {
  const { setLoading, setAccount, history, address, tokenAddress, tokenKey, setNeedAuth } = props;
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [avatar, setAvatar] = useState('');
  const [cropFile, setCropFile] = useState('');
  const [isOpenCrop, setIsOpenCrop] = useState(false);
  const [originFile, setOriginFile] = useState([]);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    getData();
  }, []);

  async function getData() {
    const reps = await getTagsInfo(address);
    if (reps) {
      setFirstname(reps.firstname || '');
      setLastname(reps.lastname || '');
      setAvatar(reps.avatar);
    }
  }

  async function saveChange() {
    if (!tokenKey) {
      setNeedAuth(true);
    } else {
      setLoading(true);
      setTimeout(async () => {
        try {
          const listSetTags = [];
          const displayName = `${firstname} ${lastname}`;
          const accountInfo = { displayName };
          listSetTags.push(setTagsInfo('display-name', displayName, { address, tokenAddress }));
          listSetTags.push(setTagsInfo('firstname', firstname, { address, tokenAddress }));
          listSetTags.push(setTagsInfo('lastname', lastname, { address, tokenAddress }));

          if (cropFile) {
            const hash = await saveFileToIpfs(cropFile);
            listSetTags.push(setTagsInfo('avatar', hash, { address, tokenAddress }));
            accountInfo.avatar = hash;
          } else {
            // respAvatar = await setTagsInfo(address, 'avatar', avatar);
            // accountInfo = { displayName };
          }
          await Promise.all(listSetTags);
          // Set to redux
          setAccount(accountInfo);
          // Show message infor
          const message = 'Change profile success!';
          enqueueSnackbar(message, { variant: 'success' });
          history.push('/');
        } catch (error) {
          console.log('error', error);
          const message = `An error occurred, please try again later`;
          enqueueSnackbar(message, { variant: 'error' });
        }
        setLoading(false);
      }, 100);
    }
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
    setCropFile(e.cropFile);
    setAvatar(e.avaPreview);
  }

  const classes = useStyles();

  return (
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
                      <AvatarPro src={avatar} className={classes.avatar} />
                    ) : (
                      <AvatarPro hash={avatar} className={classes.avatar} />
                    )}
                    <div className="changeImg">
                      <input className="fileInput" type="file" onChange={handleImageChange} accept="image/*" />
                      <CameraAltIcon />
                    </div>
                  </div>
                </PreviewContainter>
                <RightProfile>
                  <TextValidator
                    label="First Name"
                    fullWidth
                    onChange={event => setFirstname(event.currentTarget.value)}
                    name="firstname"
                    validators={['required']}
                    errorMessages={['This field is required']}
                    margin="normal"
                    value={firstname}
                  />
                  <TextValidator
                    label="Last Name"
                    fullWidth
                    onChange={event => setLastname(event.currentTarget.value)}
                    name="lastname"
                    validators={['required']}
                    errorMessages={['This field is required']}
                    margin="normal"
                    value={lastname}
                  />
                </RightProfile>
              </FlexBox>
              <DivControlBtnKeystore>
                <ButtonPro type="submit">Save change</ButtonPro>
              </DivControlBtnKeystore>
            </ValidatorForm>
            {isOpenCrop && <ImageCrop close={closeCrop} accept={acceptCrop} originFile={originFile} />}
          </ShadowBoxAuthen>
        </BoxAuthenCus>
      </LayoutAuthen>
    </QueueAnim>
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
