import styled from "styled-components";
import {
  rem,
  FlexBox,
  pc,
  mobile,
  media
} from "src/components/elements/Common";
import Head from "next/head";
import Header from "src/components/layout/Header";
import Footer from "src/components/layout/Footer";

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
    <Head>
      <title>{title}</title>
    </Head>
    <Header />
    <Content> {children} </Content>
    <Footer />
  </Container>
);
const HomeLayout = ({ children, title }) => (
  <Container>
    <Head>
      <title>{title}</title>
    </Head>
    <Header />
    <Content> {children} </Content>
    <Footer />
  </Container>
);
export { HomeLayout, Layout };
export default Layout;
