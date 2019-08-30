import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import tweb3 from '../../service/tweb3';
import { ValidatorForm, TextValidator } from 'react-material-ui-form-validator';

import * as actionsGlobal from '../../store/actions/globalData';
import * as actions from '../../store/actions/account';
import { codec } from '@iceteachain/common';
import { wallet } from '../../helper';
import { decode } from '../../helper';
import { ButtonPro } from '../elements/Button';
import CommonDialog from '../pages/Propose/CommonDialog';
import TextField from '@material-ui/core/TextField';

class GetKeyToAuthen extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      password: '',
      errMsg: '',
      loading: false,
    };
  }

  componentDidMount() {
    window.document.body.addEventListener('keydown', this._keydown);
  }

  componentWillUnmount() {
    clearTimeout(this.timeoutHanle1);
    clearTimeout(this.timeoutHanle2);
    window.document.body.removeEventListener('keydown', this._keydown);
  }

  _passwordChange = value => {
    const password = value.currentTarget.value;
    this.setState({
      password,
    });
  };

  _close = () => {
    const { props } = this;
    props.setNeedAuth(false);
    props.setAuthEle(null);
  };

  _confirm = () => {
    const { password } = this.state;
    const { setLoading, setAccount, history, encryptedData } = this.props;

    if (encryptedData) {
      if (!password) {
        this.setState({ errMsg: 'Password required.' });
        return;
      }
      setLoading(true);

      this.timeoutHanle1 = setTimeout(() => {
        try {
          let privateKey = '';
          privateKey = codec.toString(decode(password, encryptedData).privateKey);
          const address = wallet.getAddressFromPrivateKey(privateKey);
          const account = { address, privateKey, cipher: password };
          tweb3.wallet.importAccount(privateKey);
          tweb3.wallet.defaultAccount = address;
          setAccount(account);
          this.timeoutHanle2 = setTimeout(() => {
            setLoading(false);
            this._close();
          }, 50);
        } catch (err) {
          // console.log(err);
          this.setState({
            errMsg: 'Wrong Password!',
          });
          setLoading(false);
        }
      }, 100);
    }
  };

  _keydown = e => {
    if (e.keyCode === 13) this._confirm();
  };

  render() {
    const { needAuth, close } = this.props;
    const { errMsg, loading, password } = this.state;
    // console.log('render password');
    return needAuth ? (
      <CommonDialog title="Password Confirm" okText="Confirm" close={this._close} confirm={this._confirm}>
        <TextField
          id="Password"
          label="Password"
          placeholder="Enter your password"
          fullWidth
          margin="normal"
          onChange={this._passwordChange}
          type="password"
        />
      </CommonDialog>
    ) : null;
  }
}

const mapStateToProps = state => {
  const { account, globalData } = state;
  return {
    needAuth: account.needAuth,
    address: account.address,
    encryptedData: account.encryptedData,
    childKey: account.childKey,
    // mnemonic: account.mnemonic,
    triggerElement: globalData.triggerElement,
  };
};

GetKeyToAuthen.defaultProps = {
  needAuth: true,
  setAccount() {},
  setNeedAuth() {},
  dispatch() {},
  triggerElement: null,
};

const mapDispatchToProps = dispatch => {
  return {
    setAccount: data => {
      dispatch(actions.setAccount(data));
    },
    setNeedAuth: data => {
      dispatch(actions.setNeedAuth(data));
    },
    setAuthEle: data => {
      dispatch(actionsGlobal.setAuthEle(data));
    },
    setLoading: value => {
      dispatch(actionsGlobal.setLoading(value));
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(GetKeyToAuthen);
