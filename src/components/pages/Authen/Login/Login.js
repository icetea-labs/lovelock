import React, { useState } from 'react';
import { withRouter } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';
import QueueAnim from 'rc-queue-anim';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { LayoutAuthen, BoxAuthen, ShadowBoxAuthen } from '../../../elements/StyledUtils';
import { HeaderAuthen } from '../../../elements/Common';
import ByMnemonic from './ByMnemonic';
import ByPassWord from './ByPassWord';
import { LinkPro } from '../../../elements/Button';
import * as actionCreate from '../../../../store/actions/create';
import ScanQRCodeModal from '../../../elements/ScanQRCodeModal';
import SendOtpModal from '../../../elements/SendOtpModal';

const styles = () => ({
  //   button: {
  //     margin: theme.spacing(1),
  //     background: 'linear-gradient(332deg, #b276ff, #fe8dc3)',
  //   },
});

function Login(props) {
  const { history, setStep, step } = props;
  const [isQRCodeActive, setIsQRCodeActive] = useState(false);
  const [recoveryPhase, setRecoveryPhase] = useState('');
  const [isSendOtpActive, setIsSendOtpActive] = useState(false);

  function gotoRegister() {
    setStep('one');
    history.push('/register');
  }

  return (
    <div>
      <QueueAnim delay={200} type={['top', 'bottom']}>
        <LayoutAuthen key={1}>
          <BoxAuthen>
            <ShadowBoxAuthen>
              <HeaderAuthen title={<FormattedMessage id="login.login" />} />

              {step === 'one' && <ByPassWord />}
              {step === 'two' && (
                <ByMnemonic
                  setIsQRCodeActive={setIsQRCodeActive}
                  recoveryPhase={recoveryPhase}
                  setRecoveryPhase={setRecoveryPhase}
                  setIsSendOtpActive={setIsSendOtpActive}
                />
              )}
              <div className="btRegister">
                <span>
                  <FormattedMessage id="login.noAcc" />
                </span>
                <LinkPro onClick={gotoRegister}>
                  <FormattedMessage id="login.btnRegist" />
                </LinkPro>
              </div>
            </ShadowBoxAuthen>
          </BoxAuthen>
        </LayoutAuthen>
      </QueueAnim>
      {isQRCodeActive && <ScanQRCodeModal setIsQRCodeActive={setIsQRCodeActive} setRecoveryPhase={setRecoveryPhase} />}
      {isSendOtpActive && <SendOtpModal setIsSendOtpActive={setIsSendOtpActive} setRecoveryPhase={setRecoveryPhase} />}
    </div>
  );
}

const mapStateToProps = state => {
  const e = state.create;
  return {
    step: e.step,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    setStep: value => {
      dispatch(actionCreate.setStep(value));
    },
  };
};
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(Login)));
