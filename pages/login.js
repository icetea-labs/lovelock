import React, { PureComponent } from 'react';
import Container from '@material-ui/core/Container';
import Login from 'src/components/authen/login';

export default function login() {
  return (
    <Container maxWidth="xl">
      <Login />
    </Container>
  );
}
