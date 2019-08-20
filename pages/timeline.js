import React, { PureComponent } from 'react';
import Container from '@material-ui/core/Container';
import { HomeLayout } from 'src/components/layout';
import Main from 'src/components/main/Main';

export default function login() {
  return (
    <Container maxWidth="xl">
      <HomeLayout title="Couple Lock">
        <Main />
      </HomeLayout>
    </Container>
  );
}
