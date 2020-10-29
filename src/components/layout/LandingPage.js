import React, { memo } from 'react';
import styled from 'styled-components';
import Button from '@material-ui/core/Button';
import { FormattedMessage } from 'react-intl';
import QueueAnim from 'rc-queue-anim';
import { ButtonGoogle, ButtonPro, LinkPro } from '../elements/Button';
import * as actionCreate from '../../store/actions/create';
import { device } from '../../helper';
import Otp from '../pages/Authen/Otp';
import UpdateInfo from '../pages/Authen/Register/UpdateInfo';
import { useDispatch, useSelector } from 'react-redux';
import { IceteaId } from 'iceteaid-web';

const OutBox = styled.div`
  width: 100%;
  height: 100%;
  left: 0;
  top: 0;
  background-color: #ebdef6;
  bottom: 0;
  @media ${device.laptop} {
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: fixed;
  }
`;

const SplitLeft = styled.div`
  display: inline-block;
  position: relative;
  width: 100%;
  min-height: 300px;

  @media ${device.laptopL} {
    height: 100%;
    width: 50%;
    position: fixed;
    z-index: 1500;
    top: 0;
    overflow-x: hidden;
    padding-top: 20px;
    left: 0;
  }
`;

const SplitRight = styled.div`
  display: inline-block;
  position: relative;
  width: 100%;
  @media ${device.laptopL} {
    height: 100%;
    width: 50%;
    position: fixed;
    z-index: 1500;
    top: 0;
    overflow-x: hidden;
    padding-top: 50px;
    right: 0;
  }
`;

const SplitContentLeft = styled.div`
  position: absolute;
  top: 45%;
  left: 50%;
  max-width: 100%;
  width: 60%;

  transform: translate(-50%, -50%);
  .imgView {
    margin-left: 243px;
  }
  img {
    margin-top: 70px;
    display: none;
  }
  @media ${device.laptop} {
    img {
      display: block;
      transform: scale(1.6);
    }
  }
`;

const LoveLockQuote = styled.div`
  width: 100%;
  height: 100%;
  font-size: calc(20px + 1vw);
  font-family: Montserrat;
  font-weight: 700;
  font-stretch: normal;
  line-height: 1.3;
  color: #2d1949;
  position: relative;
  ::before {
    content: url('/static/img/leafQuote.svg');
    bottom: -10px;
    right: 66px;
    position: absolute;
    z-index: -10;
    transform: scale(0.7);
  }
`;

const SmallQuote = styled.div`
  width: 100%;
  height: 100%;
  font-size: 14px;
  font-family: Montserrat;
  font-weight: 400;
  padding: 20px 0 20px 0;
`;

const SplitContentRight = styled.div`
  text-align: center;

  img {
    width: 25px;
    height: 25px;
  }
  .imgView {
    margin: 16px auto;
    display: flex;
    align-items: center;
    justify-content: center;
    span {
      font-size: 18px;
    }
  }
  @media ${device.mobileS} {
    padding: 20px;
    .signUpTitle {
      font-size: 15px;
      line-height: 15px;
      font-weight: 600;
    }
    .signUpSubTitle {
      font-size: 10px;
      line-height: 15px;
      mix-blend-mode: normal;
      opacity: 0.8;
      font-family: Montserrat;
    }
    button {
      padding: 0.1em;
      font-size: 0.8em;
      height: 30px;
    }
  }

  @media ${device.tablet} {
    padding: 10px 100px;
  }

  @media ${device.laptopL} {
    position: absolute;
    color: #ffffff;
    top: 45%;
    left: 50%;
    transform: translate(-50%, -50%);

    .imgView {
      margin-bottom: 50px;
    }
    .signUpSubTitle {
      margin-bottom: 20px;
    }
  }
  @media ${device.laptopL} {
    width: 65%;
  }

  .signUpTitle {
    font-size: 25px;
    line-height: 32px;
    font-weight: 600;
  }
  .signUpSubTitle {
    font-size: 13px;
    line-height: 24px;
    mix-blend-mode: normal;
    opacity: 0.8;
    font-family: Montserrat;
  }
  .signUpBtn {
    margin-right: 16px;
    width: 130px;
    height: 40px;
    font-weight: bold;
  }
  .loginBtn {
    margin-top: 10px;
    color: #c892ff;
    width: 100%;
  }
`;

const SignupForm = styled.div`
  background-color: #43256d;
  border-radius: 10px;
  color: #ffffff;
  line-height: 1.5;
  padding: 40px 20px 40px;
  button {
    height: 50px;
  }

  @media ${device.laptop} {
    line-height: 3.5;
    padding: 20px;
  }

  @media ${device.laptopL} {
    line-height: 3.5;
    padding: 20px 100px 20px 100px;
  }

  .goBack {
    margin-bottom: 0;
    margin-top: 200px;
    button {
      color: #c892ff;
    }
  }
`;

const FooterWapper = styled.div`
  height: 20px;
  line-height: 20px;
  background: #ebdef6;
  width: 100%;
  color: #aab8c2;
  display: flex;
  font-size: 12px;
  font-weight: 300;
  border-top: 1px solid #e6ecf0;
  justify-content: center;
  padding: 8px 0;
  position: fixed;
  bottom: 0;
  left: 0;
  z-index: 1;
  @media (max-width: 768px) {
    justify-content: flex-start;
    display: none;
  }
`;

const Copyright = styled.div`
  display: flex;
  margin: 3px 0;
  line-height: 18px;
  align-items: center;
  justify-content: center;
  width: auto;
  a {
    color: inherit;
    &:hover {
      color: #8250c8;
    }
  }
  .footRight {
    margin-left: 10px;
  }
`;

const OrParagraph = styled.div`
  overflow: hidden;
  text-align: center;
  font-size: 14px;
  color: #ffffff;
  font-weight: bold;
  mix-blend-mode: normal;
  opacity: 0.2;
  line-height: 2.5;
  margin-bottom: 5px;
`;
const i = new IceteaId('xxx');

const LandingPage = memo(() => {
  const dispatch = useDispatch();
  const isLock = window.location.pathname.indexOf('/lock/') === 0;
  const step = useSelector((state) => state.create.step);

  return !isLock ? (
    <>
      <OutBox>
        <SplitLeft>
          <SplitContentLeft>
            <LoveLockQuote>
              <FormattedMessage id="landing.introTitle" />
            </LoveLockQuote>
            <SmallQuote>
              <span className="more">
                <FormattedMessage id="landing.introSubTit" />
              </span>
            </SmallQuote>
            <img src="/static/img/newLanding.svg" alt="" />
          </SplitContentLeft>
        </SplitLeft>
        <SplitRight>
          <SplitContentRight>
            <SignupForm>
              <div className="imgView">
                <img src="/static/img/logo.svg" alt="loveLock" />
                <span>
                  <FormattedMessage id="landing.lovelock" />
                </span>
              </div>
              {step !== 'four' && (
                <h1 className="signUpTitle">
                  <FormattedMessage id="landing.tagline" />
                </h1>
              )}
              {step === 'four' && (
                <h1 className="signUpTitle">
                  <FormattedMessage id="regist.updateInfo" />
                </h1>
              )}
              <QueueAnim delay={200} type={['top', 'bottom']}>
                <h2 className="signUpSubTitle">
                  <FormattedMessage id="landing.cta" />
                </h2>
                {step === 'one' && (
                  <>
                    <ButtonPro onClick={() => dispatch(actionCreate.setStep('two'))} fullWidth className="alreadyAcc">
                      <FormattedMessage id="landing.btnRegist" />
                    </ButtonPro>
                    <Button
                      onClick={() => {
                        dispatch(actionCreate.setStep('two'));
                      }}
                      className="loginBtn"
                      variant="outlined"
                      color="primary"
                    >
                      <FormattedMessage id="landing.btnLogin" />
                    </Button>
                  </>
                )}
                {step === 'two' && (
                  <>
                    <ButtonPro onClick={() => dispatch(actionCreate.setStep('three'))} fullWidth className="alreadyAcc">
                      <FormattedMessage id="regist.withPhoneOrEmail" />
                    </ButtonPro>
                    <OrParagraph>Or</OrParagraph>
                    <ButtonGoogle
                      onClick={() => i.auth.loginWithGoogle(`${process.env.REACT_APP_LOVELOCK_URL}/logging`)}
                      className="alreadyAcc"
                      fullWidth
                    >
                      Continue with Google
                    </ButtonGoogle>
                  </>
                )}
                {step === 'three' && <Otp />}
                {step === 'four' && <UpdateInfo />}
              </QueueAnim>
              <div className="goBack">
                {step !== 'one' && (
                  <>
                    <span>
                      <FormattedMessage id="login.wannaGo" />
                      <LinkPro onClick={() => dispatch(actionCreate.setStep('one'))} className="alreadyAcc">
                        <span>back?</span>
                      </LinkPro>
                    </span>
                  </>
                )}
              </div>
            </SignupForm>
          </SplitContentRight>
        </SplitRight>
      </OutBox>
      <FooterWapper>
        <Copyright>
          <p>
            Powered by&nbsp;
            <a href="https://icetea.io/" target="_blank" rel="noopener noreferrer">
              Icetea Platform
            </a>
          </p>
        </Copyright>
        <Copyright>
          <div className="footRight">
            <p>
              &copy; 2019&nbsp;
              <a href="https://trada.tech" target="_blank" rel="noopener noreferrer">
                Trada Technology
              </a>
            </p>
          </div>
        </Copyright>
      </FooterWapper>
    </>
  ) : (
    <div />
  );
});

export default LandingPage;
