import React, { PureComponent } from 'react';
import { LayoutAuthen, BoxAuthen, ShadowBoxAuthen } from '../../../elements/StyledUtils';
import { HeaderAuthen } from '../../../elements/Common';
import { connect } from 'react-redux';
import QueueAnim from 'rc-queue-anim';
import ByMnemonic from './ByMnemonic';
import ByPassWord from './ByPassWord';
// import Button from '@material-ui/core/Button';
import { withStyles } from '@material-ui/core/styles';
import { LinkPro } from '../../../elements/Button';

const styles = theme => ({
  //   button: {
  //     margin: theme.spacing(1),
  //     background: 'linear-gradient(332deg, #b276ff, #fe8dc3)',
  //   },
});

class Login extends PureComponent {
  render() {
    const { step } = this.props;
    console.log('step', step);
    return (
      <div>
        <QueueAnim delay={200} type={['top', 'bottom']}>
          <LayoutAuthen key={1}>
            <BoxAuthen>
              <ShadowBoxAuthen>
                <HeaderAuthen title="Sign In" />
                {step === 'one' && <ByPassWord />}
                {step === 'two' && <ByMnemonic />}
                <div className="btRegister">
                  <span>No account yet?</span>
                  <LinkPro href="/register">Register</LinkPro>
                </div>
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
export default withStyles(styles)(
  connect(
    mapStateToProps,
    null
  )(Login)
);
