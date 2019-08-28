import React, { PureComponent } from 'react';
import styled from 'styled-components';
import { rem } from '../../../elements/Common';
import { connect } from 'react-redux';
import QueueAnim from 'rc-queue-anim';
import LoginRecover from './LoginRecover';
import LoginWithPassWord from './LoginWithPassWord';
// import Button from '@material-ui/core/Button';
import { withStyles } from '@material-ui/core/styles';
import { LinkPro } from '../../../elements/ButtonPro';

const DivWallet = styled.div`
  position: relative;
  height: 100%;
  display: flex;
  padding-bottom: 50px;
  justify-content: center;
`;
// const DivLogo = styled.div`
//   color: #15b5dd;
//   height: 80px;
//   cursor: pointer;
//   position: absolute;
//   left: 50%;
//   transform: translate(-50%, 0);
//   width: 80px;
//   top: 10px;
//   @media (min-width: 1900px) {
//     top: 80px;
//   }
//   img {
//     width: 80px;
//   }
// `;
const RegisterBox = styled.div`
  position: absolute;
  top: 130px;
  left: 50%;
  transform: translateX(-50%);
  @media (min-width: 1900px) {
    top: 190px;
  }
  @media (max-width: 768px) {
    width: 100%;
  }
  .btRegister {
    padding-top: 20px;
    text-align: center;
  }
`;
const ShadowBox = styled.div`
  /* width: 100%; */
  background: #fff;
  /* background-image: linear-gradient(0deg, #c4dcfc, #c4dcfc); */
  border: 1px solid #dee2e6 !important;
  border-radius: 20px;
  box-shadow: 0 0 10px #e4e4e4;
  padding: ${rem(40)} ${rem(54)};
  @media (min-width: 320px) and (max-width: 623px) {
    box-shadow: none;
    padding: 5px 20px;
    box-sizing: border-box;
  }
  @media (min-width: 624px) {
    min-width: ${rem(400)};
  }
`;
const Title = styled.div`
  font-size: ${rem(20)};
  /* font-weight: bold; */
  margin-top: ${rem(10)};
`;
const StyledLogo = styled.div`
  font-size: ${rem(20)};
  display: flex;
  align-items: center;
  span {
    margin: 0 ${rem(10)};
  }
  a {
    text-decoration: none;
  }
  cursor: pointer;
`;

const styles = theme => ({
  button: {
    margin: theme.spacing(1),
    background: 'linear-gradient(332deg, #b276ff, #fe8dc3)',
  },
  link: {
    margin: theme.spacing(0),
  },
  rightIcon: {
    marginLeft: theme.spacing(1),
  },
});

class Login extends PureComponent {
  _closeModal = () => {};

  _continue = () => {};

  _hide = () => {};

  gotoHome = () => {};

  render() {
    const { step } = this.props;
    console.log('step', step);
    return (
      <div>
        <QueueAnim delay={200} type={['top', 'bottom']}>
          <DivWallet key={1}>
            <RegisterBox>
              <ShadowBox>
                <div>
                  <StyledLogo>
                    <a href="/">
                      <img src="/static/img/logo.svg" alt="itea-scan" />
                      <span>LoveLock</span>
                    </a>
                  </StyledLogo>

                  <Title>Sign In</Title>
                </div>
                {step === 'one' && <LoginWithPassWord />}
                {step === 'two' && <LoginRecover />}
                <div className="btRegister">
                  <span>Have not account yet?</span>
                  <LinkPro href="/register">Register</LinkPro>
                </div>
              </ShadowBox>
            </RegisterBox>
          </DivWallet>
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
