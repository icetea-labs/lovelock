import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import QueueAnim from 'rc-queue-anim';
import { withRouter } from 'react-router-dom';

import { LayoutAuthen, BoxAuthen, ShadowBoxAuthen } from '../../../elements/StyledUtils';
import { HeaderAuthen } from '../../../elements/Common';
import RegisterUsername from './RegisterUsername';
import RegisterSuccess from './RegisterSuccess';
import * as actionCreate from '../../../../store/actions/create';
import ImageCrop from '../../../elements/ImageCrop';

function Register(props) {
  const { step, setStep, language } = props;
  const [isOpenCrop, setIsOpenCrop] = useState(false);
  const [originFile, setOriginFile] = useState([]);
  const [avatar, setAvatar] = useState('/static/img/no-avatar.jpg');
  const [avatarData, setAvatarData] = useState('');
  const ja = 'ja';

  useEffect(() => {
    setStep('one');
  }, [setStep]);

  function closeCrop() {
    setIsOpenCrop(false);
  }

  function acceptCrop(e) {
    closeCrop();
    setAvatarData(e.cropFile);
    setAvatar(e.avaPreview);
  }

  return (
    <div>
      <QueueAnim delay={200} type={['top', 'bottom']}>
        <LayoutAuthen key={1}>
          <BoxAuthen>
            <ShadowBoxAuthen>
              {step === 'one' &&
                (language === ja ? (
                  <HeaderAuthen title="新たなアカウント作成" />
                ) : (
                  <HeaderAuthen title="Create New Account" />
                ))}
              {step === 'one' && (
                <RegisterUsername
                  setIsOpenCrop={setIsOpenCrop}
                  setOriginFile={setOriginFile}
                  avatar={avatar}
                  avatarData={avatarData}
                />
              )}
              {step === 'two' && <RegisterSuccess />}
            </ShadowBoxAuthen>
          </BoxAuthen>
        </LayoutAuthen>
      </QueueAnim>
      {isOpenCrop && <ImageCrop originFile={originFile} close={closeCrop} accept={acceptCrop} />}
    </div>
  );
}

const mapStateToProps = state => {
  return {
    step: state.create.step,
    language: state.globalData.language,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    setStep: step => {
      dispatch(actionCreate.setStep(step));
    },
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(withRouter(Register));
