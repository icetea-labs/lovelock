import React from 'react';

import styled from 'styled-components';
import { rem, FlexBox, pc, mobile, media } from '../elements/Common';
import Header from './Header';
import Footer from './Footer';

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

const Content = styled.div`
  grid-area: content;
  justify-items: center;
  align-items: center;
  width: ${rem(960)};
  margin: 0 auto;
  margin-top: 114px;
`;

const Layout = ({ children, title }) => (
  <Container>
    <Header />
    <Content> {children} </Content>
    <Footer />
  </Container>
);
const HomeLayout = ({ children, title }) => (
  <Container>
    <Header />
    <Content> {children} </Content>
    {/* <Footer /> */}
  </Container>
);
export { HomeLayout, Layout };
export default Layout;
