import React, { PureComponent } from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { callView, isAliasRegisted, wallet } from '../../../../helper';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
// import * as acGlobal from 'src/store/actions/globalData';
// import * as actions from 'src/store/actions/create';

import { DivControlBtnKeystore } from '../../../elements/Common';

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
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    borderWidth: '1px',
    borderColor: 'yellow !important',
  },
});

class LoginWithMnemonic extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      rePassErr: '',
      mnemonic: '',
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
    const { mnemonic, password } = this.state;
    const { setUsername, setStep, setLoading, setAccount } = this.props;
    try {
      console.log('mnemonic', mnemonic);
      const privateKey = wallet.getPrivateKeyFromMnemonic(mnemonic);
      const address = wallet.getAddressFromPrivateKey(privateKey);
      const account = { address, privateKey, cipher: password };
      setAccount(account);
      localStorage.setItem('user', JSON.stringify(account));
      // Router.push('/timeline');
      window.location.pathname = '/timeline';
      console.log('account', account);
    } catch (err) {
      throw err;
    }
  };

  handlePassword = event => {
    const password = event.target.value;
    // console.log(value);
    this.setState({ password });
  };
  handleMnemonic = event => {
    const mnemonic = event.target.value;
    console.log(mnemonic);
    this.setState({ mnemonic });
  };
  loginWithPrivatekey = () => {
    const { setStep } = this.props;
    setStep('one');
  };
  render() {
    const { rePassErr } = this.state;
    const { classes } = this.props;

    return (
      <div>
        <TextField
          id="outlined-multiline-static"
          label="Mnemonic phrase"
          placeholder="Enter your mnemonic phrase"
          multiline
          rows="4"
          className={classes.textField}
          onChange={this.handleMnemonic}
          margin="normal"
          variant="outlined"
          fullWidth
          helperText={rePassErr}
          error={rePassErr !== ''}
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
          <Button color="primary" onClick={this.loginWithPrivatekey} className={classes.link}>
            Login with privatekey
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
      // dispatch(actions.setUsername(value));
    },
    // setPassword: value => {
    //   dispatch(actions.setPassword(value));
    // },
    setAccount: value => {
      // dispatch(actions.setAccount(value));
    },
    setStep: value => {
      // dispatch(actions.setStep(value));
    },
    setLoading: value => {
      // dispatch(acGlobal.setLoading(value));
    },
  };
};

export default withStyles(styles)(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(LoginWithMnemonic)
);
