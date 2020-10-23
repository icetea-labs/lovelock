import QueueAnim from 'rc-queue-anim';
import { BoxAuthen, LayoutAuthen, ShadowBoxAuthen } from '../../elements/StyledUtils';
import { HeaderAuthen } from '../../elements/Common';
import { FormattedMessage } from 'react-intl';
import ByMnemonic from './Login/ByMnemonic';
import React, { useState } from 'react';

const SyncAccount = () => {
  // eslint-disable-next-line no-unused-vars
  const [isQRCodeActive, setIsQRCodeActive] = useState(false);
  const [recoveryPhase, setRecoveryPhase] = useState('');

  return (
    <div>
      <QueueAnim delay={200} type={['top', 'bottom']}>
        <LayoutAuthen key={1}>
          <BoxAuthen>
            <ShadowBoxAuthen>
              <HeaderAuthen title={<FormattedMessage id="login.syncAccount" />} />
              <ByMnemonic
                setIsQRCodeActive={setIsQRCodeActive}
                recoveryPhase={recoveryPhase}
                setRecoveryPhase={setRecoveryPhase}
                isSyncAccount={true}
              />
            </ShadowBoxAuthen>
          </BoxAuthen>
        </LayoutAuthen>
      </QueueAnim>
    </div>
  );
};

export default SyncAccount;
