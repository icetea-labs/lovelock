import React, { PureComponent } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { wallet } from '../../../../helper';
import { withStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
// import Button from '@material-ui/core/Button';
import { ButtonPro } from '../../../elements/ButtonPro';
import * as actionGlobal from '../../../../store/actions/globalData';
import * as actionAccount from '../../../../store/actions/account';
import * as actionCreate from '../../../../store/actions/create';
import tweb3 from '../../../../service/tweb3';
import { DivControlBtnKeystore } from '../../../elements/Common';
import { savetoLocalStorage } from '../../../../helper';
import encode from '../../../../helper/encode';

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

class LoginRecover extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      rePassErr: '',
      mnemonic: '',
      isPrivateKey: false,
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
    const { mnemonic, password, isPrivateKey } = this.state;
    const { setLoading, setAccount, history } = this.props;
    try {
      setLoading(true);
      setTimeout(async () => {
        let privateKey = '';
        if (isPrivateKey) {
          privateKey = mnemonic;
        } else {
          privateKey = wallet.getPrivateKeyFromMnemonic(mnemonic);
        }

        const address = wallet.getAddressFromPrivateKey(privateKey);
        const account = { address, privateKey, cipher: password };
        tweb3.wallet.importAccount(privateKey);
        tweb3.wallet.defaultAccount = address;
        setAccount(account);
        // localStorage.removeItem('user');
        // localStorage.setItem('user', JSON.stringify(account));
        const keyObject = encode(privateKey, password);
        savetoLocalStorage(address, keyObject);
        history.push('/');
        setLoading(false);
      }, 500);
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
    let isPrivateKey = false;
    const mnemonic = event.target.value.trim();
    if (mnemonic.length === 44) isPrivateKey = true;
    // console.log(mnemonic);
    this.setState({ mnemonic, isPrivateKey });
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
          label="Recovery phase or key"
          placeholder="Enter your recovery phase or key"
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
          label="New Password"
          placeholder="Enter your password"
          helperText={rePassErr}
          error={rePassErr !== ''}
          fullWidth
          margin="normal"
          onChange={this.handlePassword}
          type="password"
        />
        <DivControlBtnKeystore>
          <ButtonPro color="primary" onClick={this.loginWithPrivatekey} className={classes.link}>
            Back
          </ButtonPro>
          <ButtonPro variant="contained" color="primary" className={classes.button} onClick={this.gotoLogin}>
            Recover
          </ButtonPro>
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
  )(withRouter(LoginRecover))
);
