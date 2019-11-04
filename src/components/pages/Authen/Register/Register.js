import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import QueueAnim from 'rc-queue-anim';
import { withRouter } from 'react-router-dom';

import { LayoutAuthen, BoxAuthen, ShadowBoxAuthen } from '../../../elements/StyledUtils';
import { HeaderAuthen } from '../../../elements/Common';
import RegisterUsername from './RegisterUsername';
import RegisterSuccess from './RegisterSuccess';
import * as actionCreate from '../../../../store/actions/create';

function Register(props) {
  const { step, setStep } = props;

  useEffect(() => {
    setStep('one');
  }, [setStep]);

  return (
    <div>
      <QueueAnim delay={200} type={['top', 'bottom']}>
        <LayoutAuthen key={1}>
          <BoxAuthen>
            <ShadowBoxAuthen>
              {step === 'one' && <HeaderAuthen title="Create New Account" />}
              {step === 'one' && <RegisterUsername />}
              {step === 'two' && <RegisterSuccess />}
            </ShadowBoxAuthen>
          </BoxAuthen>
        </LayoutAuthen>
      </QueueAnim>
    </div>
  );
}

const mapStateToProps = state => {
  return {
    step: state.create.step,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    setStep: step => {
      dispatch(actionCreate.setStep(step));
    },
  };
};
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(Register));
