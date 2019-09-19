import React, { PureComponent } from 'react';
// import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import QueueAnim from 'rc-queue-anim';
import { LayoutAuthen, BoxAuthen, ShadowBoxAuthen } from '../../../elements/StyledUtils';
import { HeaderAuthen } from '../../../elements/Common';
import RegisterUsername from './RegisterUsername';
import RegisterSuccess from './RegisterSuccess';

class Register extends PureComponent {
  render() {
    const { step } = this.props;
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
}

const mapStateToProps = state => {
  const e = state.create;
  return {
    password: e.password,
    step: e.step,
    privateKey: e.privateKey,
    keyStoreText: e.keyStoreText,
    showPrivateKey: e.showPrivateKey,
    confirmMnemonic: e.confirmMnemonic,
  };
};

// const mapDispatchToProps = (dispatch) => {
//   return {
//   };
// }
export default connect(
  mapStateToProps,
  null
)(Register);
