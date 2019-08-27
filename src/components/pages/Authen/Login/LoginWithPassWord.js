import React, { PureComponent } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { codec } from '@iceteachain/common';
import { wallet } from '../../../../helper';
import { withStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import * as actionGlobal from '../../../../store/actions/globalData';
import * as actionAccount from '../../../../store/actions/account';
import * as actionCreate from '../../../../store/actions/create';
import { DivControlBtnKeystore, DivPassRecover } from '../../../elements/Common';
import tweb3 from '../../../../service/tweb3';
import { decode } from '../../../../helper';

const styles = theme => ({
  button: {
    margin: theme.spacing(1),
    background: 'linear-gradient(332deg, #b276ff, #fe8dc3)',
  },
  link: {
    margin: theme.spacing(0),
  },
  rightIcon: {
    marginLeft: theme.spacing(1),
  },
});

class LoginWithPassWord extends PureComponent {
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
    e.keyCode === 13 && this.gotoLogin();
  };

  gotoLogin = async () => {
    const { password } = this.state;
    const { setLoading, setAccount, history, encryptedData } = this.props;
    let privateKey;
    if (encryptedData) {
      const readableKey = decode(password, encryptedData).privateKey;
      privateKey = codec.toString(readableKey);
    } else return;
    console.log('privateKey', privateKey);
    try {
      setLoading(true);
      setTimeout(async () => {
        const address = wallet.getAddressFromPrivateKey(privateKey);
        const account = { address, privateKey, cipher: password };
        tweb3.wallet.importAccount(privateKey);
        tweb3.wallet.defaultAccount = address;
        setAccount(account);
        // localStorage.removeItem('user');
        // localStorage.setItem('user', JSON.stringify(account));
        history.push('/');
        setLoading(false);
      }, 500);
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
        {/* <TextField
          id="username"
          label="Privatekey"
          placeholder="Enter your private key"
          helperText={rePassErr}
          error={rePassErr !== ''}
          fullWidth
          margin="normal"
          onChange={this.handlePrivatekey}
        /> */}
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
          <DivPassRecover>
            <span>Forgot password?</span>
            <Button color="primary" onClick={this.loginWithSeed} className={classes.link}>
              Recover
            </Button>
          </DivPassRecover>
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
  const account = state.account;
  return {
    password: e.password,
    encryptedData: account.encryptedData,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    // setPassword: value => {
    //   dispatch(actions.setPassword(value));
    // },
    setAccount: value => {
      dispatch(actionAccount.setAccount(value));
    },
    setStep: value => {
      dispatch(actionCreate.setStep(value));
    },
    setLoading: value => {
      dispatch(actionGlobal.setLoading(value));
    },
  };
};

export default withStyles(styles)(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(withRouter(LoginWithPassWord))
);
