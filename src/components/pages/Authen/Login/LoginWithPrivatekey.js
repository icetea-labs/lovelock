import React, { PureComponent } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { wallet } from '../../../../helper';
import { withStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import * as actionGlobal from '../../../../store/actions/globalData';
import * as actionAccount from '../../../../store/actions/account';
import * as actionCreate from '../../../../store/actions/create';
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
    e.keyCode === 13 && this.gotoLogin();
  };

  gotoLogin = async () => {
    const { privateKey, password } = this.state;
    const { setLoading, setAccount, history } = this.props;
    try {
      setLoading(true);
      setTimeout(async () => {
        const address = wallet.getAddressFromPrivateKey(privateKey);
        const account = { address, privateKey, cipher: password };
        setAccount(account);
        localStorage.removeItem('user');
        localStorage.setItem('user', JSON.stringify(account));
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
  )(withRouter(LoginWithPrivatekey))
);
