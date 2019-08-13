import React from "react";
import Container from "@material-ui/core/Container";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import MuiLink from "@material-ui/core/Link";
import Link from "src/Link";
import styled from "styled-components";
import { HomeLayout } from "src/components/layout";
import Main from "src/components/main/Main";
import "static/css/style.css";
import '@material/react-text-field/dist/text-field.css';

export default function Index() {
  return (
    <Container maxWidth="xl">
      <HomeLayout title="Couple Lock">
        <Main />
      </HomeLayout>
    </Container>
  );
}
