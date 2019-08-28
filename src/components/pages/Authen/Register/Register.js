import React, { PureComponent } from 'react';
import styled from 'styled-components';
// import { withRouter } from 'react-router-dom';
import { rem } from '../../../elements/Common';
import { connect } from 'react-redux';
import QueueAnim from 'rc-queue-anim';
import RegisterUsername from './RegisterUsername';
import RegisterSuccess from './RegisterSuccess';

// import { Header } from "../../elements/utils";
// import { PuConfirm, PuShowPrivateKey } from "../../elements";
// import FooterCus from "../FooterCus";

const DivWallet = styled.div`
  position: relative;
  height: 100%;
  display: flex;
  padding-bottom: 50px;
  justify-content: center;
`;
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
`;
const ShadowBox = styled.div`
  /* width: 100%; */
  background: #fff;
  /* background-image: linear-gradient(0deg, #c4dcfc, #c4dcfc); */
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
class Register extends PureComponent {
  _closeModal = () => {};

  _continue = () => {};

  _hide = () => {};

  gotoHome = () => {};

  render() {
    const { step } = this.props;
    return (
      <div>
        <QueueAnim delay={200} type={['top', 'bottom']}>
          <DivWallet key={1}>
            <RegisterBox>
              <ShadowBox>
                {step !== 'three' && (
                  <div>
                    <StyledLogo>
                      <a href="/">
                        <img src="/static/img/logo.svg" alt="itea-scan" />
                        <span>LoveLock</span>
                      </a>
                    </StyledLogo>
                    <Title>Register Icetea Account</Title>
                  </div>
                )}
                {step === 'one' && <RegisterUsername />}
                {step === 'two' && <RegisterSuccess />}
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
export default connect(
  mapStateToProps,
  null
)(Register);
