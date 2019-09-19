import React, { PureComponent } from 'react';
import { withRouter } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';
import QueueAnim from 'rc-queue-anim';
import { connect } from 'react-redux';
import { LayoutAuthen, BoxAuthen, ShadowBoxAuthen } from '../../../elements/StyledUtils';
import { HeaderAuthen } from '../../../elements/Common';
import ByMnemonic from './ByMnemonic';
import ByPassWord from './ByPassWord';
import { LinkPro } from '../../../elements/Button';
import * as actionCreate from '../../../../store/actions/create';

const styles = theme => ({
  //   button: {
  //     margin: theme.spacing(1),
  //     background: 'linear-gradient(332deg, #b276ff, #fe8dc3)',
  //   },
});

class Login extends PureComponent {
  gotoRegister = () => {
    const { history, setStep } = this.props;
    setStep('one');
    history.push('/register');
  };

  render() {
    const { step } = this.props;
    // console.log('step', step);
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
                  <LinkPro onClick={this.gotoRegister}>Register</LinkPro>
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

const mapDispatchToProps = dispatch => {
  return {
    setStep: value => {
      dispatch(actionCreate.setStep(value));
    },
  };
};
export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(withStyles(styles)(Login))
);
