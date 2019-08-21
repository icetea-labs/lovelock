import React, { Component } from 'react';
import { connect } from 'react-redux';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import MuiLink from '@material-ui/core/Link';
import Link from 'src/Link';
import styled from 'styled-components';
import { HomeLayout } from 'src/components/layout';
import Main from 'src/components/main/Main';
import Timeline from 'src/components/timeline';
import Authen from 'src/components/authen';
import Router from 'next/router';

import 'static/css/style.css';
class index extends Component {
  static getInitialProps({ reduxStore, req, res }) {
    // const isServer = !!req;
    // // DISPATCH ACTIONS HERE ONLY WITH `reduxStore.dispatch`
    // reduxStore.dispatch(serverRenderClock(isServer));
    return {};
  }

  render() {
    const { isLoading, address } = this.props;
    return (
      <Container maxWidth="xl">
        <Authen />
      </Container>
    );
  }
}

const mapStateToProps = state => {
  const { globalData, userInfo } = state;
  return {
    isLoading: globalData.isLoading,
    address: userInfo.address,
  };
};

export default connect(
  mapStateToProps,
  null
)(index);
