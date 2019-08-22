import React, { PureComponent } from 'react';
import Button from '@material-ui/core/Button';
import styled from 'styled-components';
import Link from 'src/Link';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';

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
      step: 'default',
    };
  }

  goLogin = () => {
    this.setState({ step: 'login' });
  };

  goRegister = () => {
    this.setState({ step: 'register' });
  };

  componentDidMount() {
    const { address } = this.props;
    // console.log('address', address);
  }

  componentDidUpdate() {
    const { address } = this.props;
    if (address) {
      console.log('timeline', address);
      window.location.pathname = '/timeline';
    } else {
      console.log('login', address);
      window.location.pathname = '/login';
    }
    // console.log('address', address);
  }

  renderDefault = () => {
    return (
      <React.Fragment>
        <Button size="large" color="primary" variant="contained" href="/login">
          Login
        </Button>
        <Button size="large" color="primary" variant="contained" href="/register">
          Singup
        </Button>
        <Button size="large" color="primary" variant="contained" href="/timeline">
          Timeline
        </Button>
      </React.Fragment>
    );
  };

  render() {
    const { step } = this.state;

    return <Wrapper>{step === 'default' && this.renderDefault()}</Wrapper>;
  }
}

const mapStateToProps = state => {
  const e = state.account;
  return {
    address: e.address,
  };
};

export default connect(
  mapStateToProps,
  null
)(Authen);
