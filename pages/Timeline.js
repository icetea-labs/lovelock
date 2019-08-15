import React, { PureComponent } from "react";
import Container from "@material-ui/core/Container";
import { HomeLayout } from "src/components/layout";

class Timeline extends PureComponent {
  render() {
    return (
      <Container maxWidth="xl">
        <HomeLayout title="Couple Lock" />
      </Container>
    );
  }
}

Timeline.propTypes = {};

export default Timeline;
