import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { isAliasRegisted, wallet, registerAlias, setTagsInfo } from '../../../../helper';
import { withStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
// import Button from '@material-ui/core/Button';
import { ButtonPro, LinkPro } from '../../../elements/ButtonPro';
import Icon from '@material-ui/core/Icon';
import * as actionGlobal from '../../../../store/actions/globalData';
import * as actionAccount from '../../../../store/actions/account';
import * as actionCreate from '../../../../store/actions/create';
import tweb3 from '../../../../service/tweb3';
import { DivControlBtnKeystore, FlexBox } from '../../../elements/Common';
import notifi from '../../../elements/Notification';

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
  marginLeft: {
    marginLeft: theme.spacing(1),
  },
  marginRight: {
    marginRight: theme.spacing(1),
    paddingRight: theme.spacing(1),
  },
});

let myTime = '';
class RegisterUsername extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      usernameErr: '',
      firstname: '',
      firstnameErr: '',
      lastname: '',
      lastnameErr: '',
      password: '',
      passwordErr: '',
      rePassword: '',
      rePassErr: '',
    };
  }
  componentDidMount() {
    window.document.body.addEventListener('keydown', this._keydown);
  }
  componentWillUnmount() {
    window.document.body.removeEventListener('keydown', this._keydown);
  }
  _keydown = e => {
    e.keyCode === 13 && this.gotoNext();
  };

  gotoNext = async () => {
    const { username, firstname, lastname, password, rePassword } = this.state;
    const { setStep, setLoading, setAccount } = this.props;

    if (!this.isInvalidateData()) {
      const resp = await isAliasRegisted(username);
      if (resp) {
        this.setState({
          usernameErr: 'Username already exists! Please choose another',
        });
      } else {
        setLoading(true);
        setTimeout(async () => {
          const account = await this._createAccountWithMneomnic();
          const privateKey = account.privateKey;
          const address = account.address;
          const displayname = firstname + ' ' + lastname;

          setAccount({ username, address, privateKey, cipher: password, mnemonic: account.mnemonic });
          tweb3.wallet.importAccount(privateKey);
          tweb3.wallet.defaultAccount = address;

          const resp = await registerAlias(username, address, privateKey);
          console.log('resp', resp);
          const respTags = await setTagsInfo(address, 'display-name', displayname);
          console.log('respTags', respTags);

          if (resp && respTags) {
            setLoading(false);
            setStep('two');
          } else {
            notifi.info('Error registerAlias');
          }
        }, 500);
      }
    }
  };

  isInvalidateData() {
    const { username, firstname, lastname, password, rePassword } = this.state;

    if (!username) {
      this.setState({
        usernameErr: 'The Username field is required',
      });
      return true;
    } else {
      const { usernameErr } = this.state;
      if (usernameErr) this.setState({ usernameErr: '' });
    }

    if (!firstname) {
      this.setState({
        firstnameErr: 'The Firstname field is required',
      });
      return true;
    } else {
      const { firstnameErr } = this.state;
      if (firstnameErr) this.setState({ firstnameErr: '' });
    }

    if (!lastname) {
      this.setState({
        lastnameErr: 'The Lastname field is required',
      });
      return true;
    } else {
      const { lastnameErr } = this.state;
      if (lastnameErr) this.setState({ lastnameErr: '' });
    }

    if (!password) {
      this.setState({
        passwordErr: 'The password field is required',
      });
      return true;
    } else {
      const { passwordErr } = this.state;
      if (passwordErr) this.setState({ passwordErr: '' });
    }

    if (!rePassword) {
      this.setState({
        rePassErr: 'The confirm password field is required',
      });
      return true;
    }

    if (password !== rePassword) {
      this.setState({
        rePassErr: 'The confirmation password do not match.',
      });
      return true;
    } else {
      const { rePassErr } = this.state;
      if (rePassErr) this.setState({ rePassErr: '' });
    }

    return false;
  }

  handleUsername = event => {
    const key = event.currentTarget.id;
    const value = event.currentTarget.value;
    console.log(event.currentTarget.id);
    this.setState({ [key]: value });
    if (key === 'username') {
      this.checkAliasRegisted(value);
    }
  };

  checkAliasRegisted = username => {
    if (myTime) clearTimeout(myTime);
    myTime = setTimeout(async () => {
      const resp = await isAliasRegisted(username);
      if (resp) {
        this.setState({
          usernameErr: 'Username already exists! Please choose another',
        });
      } else {
        this.setState({
          usernameErr: '',
        });
      }
    }, 1500);
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

  render() {
    const { usernameErr, rePassErr, lastnameErr, firstnameErr, passwordErr } = this.state;
    const { classes } = this.props;

    return (
      <div>
        <TextField
          id="username"
          label="Username"
          required
          placeholder="Enter your username"
          helperText={usernameErr}
          error={usernameErr !== ''}
          fullWidth
          margin="normal"
          onChange={this.handleUsername}
        />
        <FlexBox>
          <TextField
            id="firstname"
            label="First Name"
            required
            placeholder="Enter your fistname"
            helperText={firstnameErr}
            error={firstnameErr !== ''}
            fullWidth
            className={classes.marginRight}
            margin="normal"
            onChange={this.handleUsername}
          />
          <TextField
            id="lastname"
            label="Last Name"
            helperText={lastnameErr}
            error={lastnameErr !== ''}
            required
            placeholder="Enter your lastname"
            fullWidth
            margin="normal"
            onChange={this.handleUsername}
          />
        </FlexBox>
        <TextField
          id="password"
          label="Password"
          helperText={passwordErr}
          error={passwordErr !== ''}
          required
          placeholder="Password"
          fullWidth
          margin="normal"
          onChange={this.handleUsername}
          type="password"
        />
        <TextField
          id="rePassword"
          label="Confirm Password"
          helperText={rePassErr}
          error={rePassErr !== ''}
          required
          placeholder="Confirm your password"
          fullWidth
          margin="normal"
          onChange={this.handleUsername}
          type="password"
        />
        <DivControlBtnKeystore>
          <LinkPro href="/login">Login</LinkPro>
          <ButtonPro onClick={this.gotoNext}>
            Next
            <Icon className={classes.rightIcon}>arrow_right_alt</Icon>
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
  )(RegisterUsername)
);
