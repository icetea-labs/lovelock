import React, { useEffect, useState } from 'react';
import QueueAnim from 'rc-queue-anim';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';
import { LayoutAuthen, BoxAuthen, ShadowBoxAuthen } from '../../../elements/StyledUtils';
import * as actionCreate from '../../../../store/actions/create';
import { IceteaId } from 'iceteaid-web';
import ByMnemonic from './ByMnemonic';
import ScanQRCodeModal from '../../../elements/ScanQRCodeModal';
import { setStep } from '../../../../store/actions/create';
import { useHistory } from 'react-router-dom';

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

export default function SyncAccount() {
  const dispatch = useDispatch();
  const step = useSelector(state => state.create.step);
  const [isQRCodeActive, setIsQRCodeActive] = useState(false);
  const [recoveryPhase, setRecoveryPhase] = useState('');
  const history = useHistory();

  useEffect(() => {
    const checkHaveAcc = async () => {
      const key = await i.user.getKey();
      if (key.payload) {
        dispatch(setStep('two'));
        return history.push('/login')
      }
    }
    checkHaveAcc()
  }, [])

  return (
    <>
      <QueueAnim delay={200} type={['top', 'bottom']}>
        <LayoutAuthen key={1}>
          <BoxAuthen>
            <ShadowBoxAuthen>
              <>
                <ByMnemonic
                  setIsQRCodeActive={setIsQRCodeActive}
                  recoveryPhase={recoveryPhase}
                  setRecoveryPhase={setRecoveryPhase}
                  isSyncAccount={true}
                />
              </>
            </ShadowBoxAuthen>
          </BoxAuthen>
        </LayoutAuthen>
      </QueueAnim>
      {isQRCodeActive && <ScanQRCodeModal setIsQRCodeActive={setIsQRCodeActive} setRecoveryPhase={setRecoveryPhase} />}
    </>
  );
}
