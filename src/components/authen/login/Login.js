import React, { PureComponent } from "react";
import styled from "styled-components";
import { withRouter } from "next/router";
import { connect } from "react-redux";
import QueueAnim from "rc-queue-anim";
// import * as actions from "../../../store/actions/create";
// import { theme, zIndex } from './../../../constants/Styles';
// import NewWallet01 from "./NewWallet01";
// import NewWallet02 from "./NewWallet02";
// import NewWallet03 from "./NewWallet03";
// import NewWallet04 from "./NewWallet04";
// import NewWallet05 from "./NewWallet05";
// import pencil from "../../../assets/img/pencil.svg";

// import { Header } from "../../elements/utils";
// import { PuConfirm, PuShowPrivateKey } from "../../elements";
import InputPassword from "../../elements/InputPassword";
// import FooterCus from "../FooterCus";

const DivWallet = styled.div`
  position: relative;
  height: 100%;
  display: flex;
  padding-bottom: 50px;
  justify-content: center;
`;
const DivLogo = styled.div`
  color: #15b5dd;
  height: 80px;
  cursor: pointer;
  position: absolute;
  left: 50%;
  transform: translate(-50%, 0);
  width: 80px;
  top: 10px;
  @media (min-width: 1900px) {
    top: 80px;
  }
  img {
    width: 80px;
  }
`;
const DivBox1 = styled.div`
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
const DivBox2 = styled.div`
  width: 100%;
  background: #fff;
  box-shadow: 0 0 10px #e4e4e4;
  padding: 40px 54px;
  @media (min-width: 320px) and (max-width: 623px) {
    box-shadow: none;
    padding: 5px 20px;
    box-sizing: border-box;
  }
  @media (min-width: 624px) {
    width: 500px;
  }
`;
const WrapperImgPencil = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  img {
    width: 80px;
    margin-bottom: 20px;
  }
`;
export const Header = styled.div`
  font-size: 24px;
  font-weight: bold;
  margin-top: 10px;
  padding-bottom: 18px;
  text-align: center;
  /* font-family: DIN; */
`;

class Login extends PureComponent {
  _closeModal = () => {};

  _continue = () => {};

  _hide = () => {};

  gotoHome = () => {};

  render() {
    let { confirmMnemonic, showPrivateKey, privateKey, step } = this.props;
    // console.log('00-step', showPrivateKey);
    return (
      // <ThemeProvider theme={ theme }>
      <div>
        <QueueAnim delay={200} type={["top", "bottom"]}>
          <DivWallet key={1}>
            <DivBox1>
              <DivBox2>
                <div>
                  <Header>Regiter</Header>
                </div>
                {/* {step === "success" && <NewWallet05 />} */}
              </DivBox2>
              <InputPassword />
            </DivBox1>
          </DivWallet>
        </QueueAnim>
        {showPrivateKey && (
          <PuShowPrivateKey privateKey={privateKey} close={this._closeModal} />
        )}
        {confirmMnemonic && (
          <PuConfirm
            okText="Yes"
            cancelText="Go Back"
            confirm={this._continue}
            cancel={this._hide}
          >
            <WrapperImgPencil>
              <img src={pencil} alt="" />
              <p>Are you sure you have noted down your Mnemonic Phrase?</p>
            </WrapperImgPencil>
          </PuConfirm>
        )}
      </div>
      // </ThemeProvider>
    );
  }
}

const mapStateToProps = state => {
  return {};
};

// const mapDispatchToProps = (dispatch) => {
//   return {
//   };
// }
export default connect(
  mapStateToProps,
  null
)(Login);
