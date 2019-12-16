import React from 'react';

import styled from 'styled-components';
import { rem, pc, mobile, media } from '../elements/StyledUtils';
import Header from './Header';
// import Footer from './Footer';

const Container = styled.div`
  flex-direction: column;
  min-height: 100vh;
  max-width: ${pc.pagemaxwidth};
  min-width: ${pc.pageminwidth};
  /* background-color: #fdfdfd; */
  ${media.mobile`
    max-width: ${mobile.pagemaxwidth};
    min-width: ${mobile.pageminwidth};
  `}
`;
const MainContainer = styled.main`
  height: 100%;
  flex: 1 1 0%;
`;
const BoxContent = styled.div`
  grid-area: content;
  justify-items: center;
  align-items: center;
  width: 100%;
  max-width: ${rem(960)};
  margin: 0 auto;
`;
const Content = styled(BoxContent)`
  margin-top: ${rem(30)};
  @media (max-width: 768px) {
    margin-top: 0;
  }
`;

const Layout = ({ children }) => (
  <Container>
    <Content> {children} </Content>
    {/* <Footer /> */}
  </Container>
);
const HomeLayout = ({ children }) => (
  <Container>
    <Header />
    <MainContainer>
      <Content> {children} </Content>
    </MainContainer>
    {/* <Footer /> */}
  </Container>
);
const LandingLayout = ({ children }) => (
  <React.Fragment>
    <Header />
    <Content> {children} </Content>
  </React.Fragment>
);
export { HomeLayout, Layout, LandingLayout };
export default Layout;
