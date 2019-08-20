import React, { PureComponent } from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import tweb3 from 'src/service/tweb3';
import { callView, isAliasRegisted, wallet } from 'src/helper';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Icon from '@material-ui/core/Icon';
import * as acGlobal from 'src/store/actions/globalData';
import * as actions from 'src/store/actions/create';
import * as actionsAccount from 'src/store/actions/account';
import { DivControlBtnKeystore } from 'src/components/elements/Common';

const styles = theme => ({
  button: {
    margin: theme.spacing(1),
    background: 'linear-gradient(332deg, #b276ff, #fe8dc3)',
  },
  link: {
    margin: theme.spacing(1),
  },
  rightIcon: {
    marginLeft: theme.spacing(1),
  },
});

class LoginWithPrivatekey extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      rePassErr: '',
      privateKey: '',
      password: '',
    };
  }
  componentDidMount() {
    window.document.body.addEventListener('keydown', this._keydown);
  }
  componentWillUnmount() {
    window.document.body.removeEventListener('keydown', this._keydown);
  }

  _keydown = e => {
    const { props } = this;
    e.keyCode === 13 && this.gotoLogin();
  };

  gotoLogin = async () => {
    const { privateKey, password } = this.state;
    const { setUsername, setStep, setLoading, setAccount } = this.props;
    try {
      const address = wallet.getAddressFromPrivateKey(privateKey);
      const account = { address, privateKey, cipher: password };
      setAccount(account);
      console.log('account', account);
    } catch (err) {
      throw err;
    }
  };

  handlePassword = event => {
    const password = event.currentTarget.value;
    // console.log(value);
    this.setState({ password });
  };
  handlePrivatekey = event => {
    const privateKey = event.currentTarget.value;
    this.setState({ privateKey });
  };
  loginWithSeed = () => {
    const { setStep } = this.props;
    setStep('two');
  };
  render() {
    const { rePassErr } = this.state;
    const { classes } = this.props;

    return (
      <div>
        <TextField
          id="username"
          label="Privatekey"
          placeholder="Enter your private key"
          helperText={rePassErr}
          error={rePassErr !== ''}
          fullWidth
          margin="normal"
          onChange={this.handlePrivatekey}
        />
        <TextField
          id="rePassword"
          label="Password"
          placeholder="Enter your password"
          helperText={rePassErr}
          error={rePassErr !== ''}
          fullWidth
          margin="normal"
          onChange={this.handlePassword}
          type="password"
        />
        <DivControlBtnKeystore>
          <Button color="primary" onClick={this.loginWithSeed} className={classes.link}>
            Login with seed
          </Button>
          <Button variant="contained" color="primary" className={classes.button} onClick={this.gotoLogin}>
            Login
          </Button>
        </DivControlBtnKeystore>
      </div>
    );
  }
}

const mapStateToProps = state => {
  const e = state.create;
  return {
    password: e.password,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    setUsername: value => {
      dispatch(actions.setUsername(value));
    },
    // setPassword: value => {
    //   dispatch(actions.setPassword(value));
    // },
    setAccount: value => {
      dispatch(actionsAccount.setAccount(value));
    },
    setStep: value => {
      dispatch(actions.setStep(value));
    },
    setLoading: value => {
      dispatch(acGlobal.setLoading(value));
    },
  };
};

export default withStyles(styles)(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(LoginWithPrivatekey)
);
