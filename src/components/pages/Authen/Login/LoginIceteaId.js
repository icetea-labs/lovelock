import React, { useEffect, useState } from 'react';
import QueueAnim from 'rc-queue-anim';
import { FormattedMessage } from 'react-intl';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';
import { LayoutAuthen, BoxAuthen, ShadowBoxAuthen } from '../../../elements/StyledUtils';
import { HeaderAuthen } from '../../../elements/Common';
import * as actionCreate from '../../../../store/actions/create';
import { ButtonPro, ButtonGoogle } from '../../../elements/Button';
import { IceteaId } from 'iceteaid-web';
import ByMnemonic from './ByMnemonic';
import Otp from '../Otp';
import OldUserModal from '../../../elements/OldUserModal';
import ScanQRCodeModal from '../../../elements/ScanQRCodeModal';
import * as actions from '../../../../store/actions';
import { SimpleLoading } from '../../../elements/GlobaLoading';
import globalData from '../../../../store/reducers/globalData';

const i = new IceteaId('xxx')

const DivActionButton = styled.div`
  margin: 15px 0 15px 0
`;

const OrParagraph = styled.div`
  margin-bottom: 16px;
  margin-top: 16px;
  overflow: hidden;
  text-align: center;
  font-size: 14px;
  color: rgb(51, 51, 51);
  font-weight: bold;
`;

export default function LoginIceteaId() {
  const dispatch = useDispatch();
  const step = useSelector(state => state.create.step);
  const isLoading = useSelector(state => state.globalData.isLoading);
  const [isQRCodeActive, setIsQRCodeActive] = useState(false);
  const [recoveryPhase, setRecoveryPhase] = useState('');
  const [isOldUserActive, setIsOldUserActive] = useState(true);

  useEffect(() => {
     const alreadyShowModal = localStorage.getItem('isShowModal');
    if (alreadyShowModal) setIsOldUserActive(false);
  }, [])

  useEffect(() => {
    if (step !== 'one') {
      setIsOldUserActive(false);
    }
    if (step === 'two') {
      dispatch(actions.setLoading(true));
      decryptKey().finally(dispatch(actions.setLoading(false)));
    }
  }, [step])

  const decryptKey = async () => {
    try {
      const key = await i.user.getKey();
      const { private_key , encryption_key, mnemonic } = key.payload;
      const decrypted = await i.user.decryptKey(private_key , encryption_key, mnemonic)
      setRecoveryPhase(decrypted.payload.mnemonic)
    } catch (err) {
      dispatch(actionCreate.setStep('one'));
    }
  }

  const loginNewAccount = async () => {
    setIsOldUserActive(false);
    localStorage.setItem('isShowModal', 'true')
  }

  const loginWithGoogle = async () => {
    const isLogin = await i.auth.isLogin();
    if (isLogin.payload) {
      dispatch(actionCreate.setStep('two'));
      return decryptKey();
    }
    return i.auth.loginWithGoogle(`${process.env.REACT_APP_LOVELOCK_URL}/checkAccount`)
  }

  const syncAccount = async () => {
    setIsOldUserActive(false);
    localStorage.setItem('isShowModal', 'true')
    localStorage.setItem('needSync', 'true')
  }

  return (
    <>
      {isLoading && <SimpleLoading />}
      <QueueAnim delay={200} type={['top', 'bottom']}>
        <LayoutAuthen key={1}>
          <BoxAuthen>
            <ShadowBoxAuthen>
              <>
                <HeaderAuthen title={<FormattedMessage id="login.login" />} />
                {step === 'one' && <>
                  <DivActionButton>
                    <ButtonPro onClick={() => dispatch(actionCreate.setStep('three'))} fullWidth className="alreadyAcc">
                      <FormattedMessage id="regist.withPhoneOrEmail" />
                    </ButtonPro>
                  </DivActionButton>
                  <OrParagraph>
                    Or
                  </OrParagraph>
                  <DivActionButton>
                    <ButtonGoogle
                      className="alreadyAcc"
                      fullWidth
                      onClick={loginWithGoogle}
                    >
                      Continue with Google
                    </ButtonGoogle>
                  </DivActionButton>
                </>}
                {step === 'two' && (
                  <ByMnemonic
                    setIsQRCodeActive={setIsQRCodeActive}
                    recoveryPhase={recoveryPhase}
                    setRecoveryPhase={setRecoveryPhase}
                    isSyncAccount={true}
                  />
                )}
                {step === 'three' && <Otp />}
              </>
            </ShadowBoxAuthen>
          </BoxAuthen>
        </LayoutAuthen>
      </QueueAnim>
      {isOldUserActive && <OldUserModal setIsOldUserActive={setIsOldUserActive}
                                        loginNewAccount={loginNewAccount}
                                        syncAccount={syncAccount}
      />}
      {isQRCodeActive && <ScanQRCodeModal setIsQRCodeActive={setIsQRCodeActive} setRecoveryPhase={setRecoveryPhase} />}
    </>
  );
}
