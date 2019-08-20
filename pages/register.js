import React, { PureComponent } from 'react';
import Container from '@material-ui/core/Container';
import Register from 'src/components/authen/register';

export default function login() {
  return (
    <Container maxWidth="xl">
      <Register />
    </Container>
  );
}
