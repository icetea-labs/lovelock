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
      username: '',
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
    e.keyCode === 13 && this.gotoNext();
  };
  gotoNext = async () => {
    const { username } = this.state;
    const { setUsername, setStep, setLoading, setAccount } = this.props;

    if (username) {
      const resp = await isAliasRegisted(username);
      if (resp) {
        this.setState({
          rePassErr: 'Username already exists! Please choose another',
        });
      } else {
        setLoading(true);
        setTimeout(async () => {
          const account = await this._createAccountWithMneomnic();
          setAccount({
            privateKey: account.privateKey,
            mnemonic: account.mnemonic,
            address: account.address,
            step: 'inputPassword',
            username: username,
          });
          setLoading(false);
        }, 500);
      }
    } else {
      this.setState({
        rePassErr: 'Username is required',
      });
    }
  };

  handleUsername = event => {
    const username = event.currentTarget.value;
    // console.log(value);
    this.setState({ username });
  };
  _createAccountWithMneomnic = () => {
    const resp = wallet.createAccountWithMneomnic();
    // const keyObject = encode(resp.privateKey, 'a');
    return {
      privateKey: resp.privateKey,
      address: resp.address,
      mnemonic: resp.mnemonic,
    };
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
          onChange={this.handleUsername}
        />
        <TextField
          id="rePassword"
          label="Password"
          placeholder="Enter your password"
          helperText={rePassErr}
          error={rePassErr !== ''}
          fullWidth
          margin="normal"
          onChange={this.handleUsername}
          type="password"
        />
        <DivControlBtnKeystore>
          <Button color="primary" onClick={this.loginWithSeed} className={classes.link}>
            Login with seed
          </Button>
          <Button variant="contained" color="primary" className={classes.button} onClick={this.gotoNext}>
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
      dispatch(actions.setAccount(value));
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