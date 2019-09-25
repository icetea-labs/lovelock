import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import QueueAnim from 'rc-queue-anim';
import { makeStyles } from '@material-ui/core/styles';
import { ValidatorForm, TextValidator } from 'react-material-ui-form-validator';

import { getTagsInfo, setTagsInfo, saveToIpfs } from '../../../helper';
import { ButtonPro } from '../../elements/Button';
import * as actionGlobal from '../../../store/actions/globalData';
import * as actionAccount from '../../../store/actions/account';
import * as actionCreate from '../../../store/actions/create';
import { DivControlBtnKeystore, FlexBox, LayoutAuthen, BoxAuthen, ShadowBoxAuthen } from '../../elements/StyledUtils';
import { HeaderAuthen } from '../../elements/Common';
import AvatarPro from '../../elements/AvatarPro';
import ImageCrop from '../../elements/ImageCrop';

const useStyles = makeStyles(theme => ({
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
  .createBtnWrapper {
    padding: 10px 0 0 0;
    cursor: pointer;
  }

  .createBtn {
    margin: 0 10px 0 10px;
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
`;

const RightProfile = styled.div`
  margin-left: 8px;
`;

function ChangeProfile(props) {
  const { setLoading, setAccount, history, address, privateKey, setNeedAuth } = props;
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [avatar, setAvatar] = useState('');
  const [cropFile, setCropFile] = useState('');
  const [isOpenCrop, setIsOpenCrop] = useState(false);

  useEffect(() => {
    getData();
  }, []);

  async function getData() {
    if (address) {
      const reps = await getTagsInfo(address);
      setFirstname(reps.firstname || '');
      setLastname(reps.lastname || '');
      setAvatar(reps.avatar);
    }
  }

  async function saveChange() {
    if (!privateKey) {
      setNeedAuth(true);
    } else {
      setLoading(true);
      setTimeout(async () => {
        const displayName = `${firstname} ${lastname}`;

        let respAvatar;
        const respTagName = await setTagsInfo(address, 'display-name', displayName);
        const respTagFirst = await setTagsInfo(address, 'firstname', firstname);
        const respTagLast = await setTagsInfo(address, 'lastname', lastname);
        if (cropFile) {
          const hash = await saveToIpfs(cropFile);
          respAvatar = await setTagsInfo(address, 'avatar', hash);
          setAccount({ displayName, avatar: hash });
        } else {
          respAvatar = await setTagsInfo(address, 'avatar', avatar);
          setAccount({ displayName, avatar });
        }

        if (respTagName && respAvatar && respTagFirst && respTagLast) {
          history.push('/');
        } else {
          // notifi.info('Error registerAlias');
        }
        setLoading(false);
      }, 500);
    }
  }

  function openCrop() {
    setIsOpenCrop(true);
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
                    <div className="createBtnWrapper">
                      <button className="createBtn" type="button" onClick={openCrop}>
                        Create Avatar
                      </button>
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
            {isOpenCrop && <ImageCrop close={closeCrop} accept={acceptCrop} />}
          </ShadowBoxAuthen>
        </BoxAuthenCus>
      </LayoutAuthen>
    </QueueAnim>
  );
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

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ChangeProfile);
