import React, { PureComponent } from 'react';
import styled from 'styled-components';
import { withRouter } from 'react-router-dom';
import Button from '@material-ui/core/Button';
import { ThemeProvider } from '@material-ui/styles';
import { createMuiTheme } from '@material-ui/core/styles';

const OutBox = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const SplitLeft = styled.div`
  height: 100%;
  width: 50%;
  position: fixed;
  z-index: 1;
  top: 0;
  overflow-x: hidden;
  padding-top: 20px;
  left: 0;
  background-color: #8250c8;
  color: #fff;
  background-image: url('/static/img/landing.svg');
`;

const SplitRight = styled.div`
  height: 100%;
  width: 50%;
  position: fixed;
  z-index: 1;
  top: 0;
  overflow-x: hidden;
  padding-top: 20px;
  right: 0;
  background-color: #fff;
`;

const SplitContentLeft = styled.div`
  position: absolute;
  top: 50%;
  right: -15%;
  transform: translate(-50%, -50%);
  text-align: center;
  img {
    width: 254px;
    height: 64px;
  }
  .imgView {
    margin-left: 243px;
  }
`;

const DesContainer = styled.div`
  margin-top: 20px;
`;

const LoveLockDescript = styled.div`
  width: 494px;
  height: 100%;
  font-family: Montserrat;
  font-size: 18px;
  font-weight: bold;
  font-style: italic;
  font-stretch: normal;
  line-height: normal;
  letter-spacing: normal;
  text-align: right;
  color: #ffffff;
  .desTitle {
    font-size: 36px;
    align-items: right;
  }
`;

const SplitContentRight = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: left;
  img {
    width: 64px;
    height: 64px;
  }
  .imgView {
    margin: 16px auto;
  }
  .signUpTitle {
    font-size: 25px;
    line-height: 32px;
  }
  .signUpSubTitle {
    color: #14171a;
    font-size: 18px;
    line-height: 24px;
    margin: 16px auto;
  }
  .signUpBtn {
    margin-right: 16px;
    width: 130px;
    height: 40px;
  }
`;

const SignupForm = styled.div`
  margin: 30px auto;
`;

const FooterWapper = styled.div`
  height: 20px;
  line-height: 20px;
  background: #fff;
  width: 100%;
  color: #848e9c;
  display: flex;
  font-size: 13px;
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

const CopyRight = styled.div`
  display: flex;
  margin: 3px 0;
  line-height: 18px;
  align-items: center;
  justify-content: center;
  width: auto;
  a {
    color: inherit;
    &:hover {
      color: #fe8dc3;
    }
  }
  .footRight {
    margin-left: 10px;
  }
`;

const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#8250c8',
      contrastText: '#fff',
    },
  },
});

class LandingPage extends PureComponent {
  render() {
    const currentUrl = window.location.href;
    const isPropose = currentUrl.includes('propose');
    return !isPropose ? (
      <React.Fragment>
        <OutBox>
          <SplitLeft>
            <SplitContentLeft>
              <div className="imgView">
                <img src="/static/img/landingLogo.svg" alt="landingLogo" />
              </div>
              <DesContainer>
                <LoveLockDescript>
                  <span className="desTitle">Donec iaculis consequat vehicula.</span>
                </LoveLockDescript>
                <LoveLockDescript>
                  <span>
                    Vestibulum consequat mauris et ligula pretium imperdiet eget ut risus. In sit amet lacinia tellus.
                  </span>
                </LoveLockDescript>
              </DesContainer>
            </SplitContentLeft>
          </SplitLeft>
          <SplitRight>
            <SplitContentRight>
              <div className="imgView">
                <img src="/static/img/logo.svg" alt="loveLock" />
              </div>
              <h1 className="signUpTitle">Love written in the blocks.</h1>
              <SignupForm>
                <h2 className="signUpSubTitle">Join us now.</h2>
                <Button href="/login" className="signUpBtn" variant="contained" color="primary">
                  LOGIN
                </Button>
                <ThemeProvider theme={theme}>
                  <Button href="/register" className="signUpBtn" variant="contained" color="primary">
                    Register
                  </Button>
                </ThemeProvider>
              </SignupForm>
            </SplitContentRight>
          </SplitRight>
        </OutBox>
        <FooterWapper>
          <CopyRight>
            <p>
              Powered by&nbsp;
              <a href="https://icetea.io/" target="_blank" rel="noopener noreferrer">
                Icetea Platform
              </a>
            </p>
          </CopyRight>
          <CopyRight>
            <div className="footRight">
              <p>
                &copy; 2019&nbsp;
                <a href="https://trada.tech" target="_blank" rel="noopener noreferrer">
                  TradaTech
                </a>
              </p>
            </div>
          </CopyRight>
        </FooterWapper>
      </React.Fragment>
    ) : (
      <div />
    );
  }
}

export default withRouter(LandingPage);
