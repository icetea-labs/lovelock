import React, { PureComponent } from "react";
import Button from "@material-ui/core/Button";
import styled from "styled-components";
import Link from "src/Link";

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 500px;
  button {
    margin: 0 20px;
  }
`;

class Authen extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      step: "default"
    };
  }

  goLogin = () => {
    this.setState({ step: "login" });
  };

  goRegister = () => {
    this.setState({ step: "register" });
  };

  renderDefault = () => {
    return (
      <React.Fragment>
        <Button
          size="large"
          color="primary"
          variant="contained"
          // onClick={this.goLogin}
          href="/login"
        >
          Login
        </Button>
        <Button
          size="large"
          color="primary"
          variant="contained"
          href="/register"
        >
          Singup
        </Button>
      </React.Fragment>
    );
  };

  render() {
    const { step } = this.state;

    return <Wrapper>{step === "default" && this.renderDefault()}</Wrapper>;
  }
}

Authen.propTypes = {};

export default Authen;
