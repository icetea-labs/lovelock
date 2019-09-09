import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { isAliasRegisted, wallet, registerAlias, setTagsInfo } from '../../../../helper';
import { withStyles } from '@material-ui/core/styles';
// import TextField from '@material-ui/core/TextField';
// import Button from '@material-ui/core/Button';
import { ButtonPro, LinkPro } from '../../../elements/Button';
import Icon from '@material-ui/core/Icon';
import * as actionGlobal from '../../../../store/actions/globalData';
import * as actionAccount from '../../../../store/actions/account';
import * as actionCreate from '../../../../store/actions/create';
import tweb3 from '../../../../service/tweb3';
import { DivControlBtnKeystore, FlexBox } from '../../../elements/StyledUtils';
import notifi from '../../../elements/Notification';
import { ValidatorForm, TextValidator } from 'react-material-ui-form-validator';

const styles = theme => ({
  rightIcon: {
    marginLeft: theme.spacing(1),
  },
  marginRight: {
    marginRight: theme.spacing(1),
    paddingRight: theme.spacing(1),
  },
});

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
    ValidatorForm.addValidationRule('isPasswordMatch', value => {
      if (value !== this.state.password) {
        return false;
      }
      return true;
    });

    ValidatorForm.addValidationRule('isAliasRegisted', async username => {
      const resp = await isAliasRegisted(username);
      // console.log('isAliasRegisted', !!resp);
      return !resp;
    });
  }
  componentWillUnmount() {
    // remove rule when it is not needed
    ValidatorForm.removeValidationRule('isPasswordMatch');
    ValidatorForm.removeValidationRule('isAliasRegisted');
  }

  gotoNext = async () => {
    const { username, firstname, lastname, password } = this.state;
    const { setStep, setLoading, setAccount } = this.props;

    if (username) {
      const resp = await isAliasRegisted(username);
      if (resp) {
        this.setState({
          usernameErr: 'Username already exists! Please choose another',
        });
      } else {
        setLoading(true);
        setTimeout(async () => {
          const account = await this._createAccountWithMneomnic();
          const { privateKey, address, publicKey, mnemonic } = account;
          const displayname = firstname + ' ' + lastname;
          console.log('publicKey', publicKey);
          setAccount({ username, address, privateKey, publicKey, cipher: password, mnemonic });
          tweb3.wallet.importAccount(privateKey);
          tweb3.wallet.defaultAccount = address;

          const resp = await registerAlias(username, address, privateKey);
          // console.log('resp', resp);
          const respTagName = await setTagsInfo(address, 'display-name', displayname);
          const respTagPublicKey = await setTagsInfo(address, 'pub-key', publicKey);
          console.log('respTags', respTagName);

          if (resp && respTagName && respTagPublicKey) {
            setStep('two');
          } else {
            notifi.info('Error registerAlias');
          }
          setLoading(false);
        }, 500);
      }
    }
  };

  handleUsername = event => {
    const key = event.currentTarget.name;
    const value = event.currentTarget.value;
    console.log(event.currentTarget.id);

    this.setState({ [key]: value });
  };

  _createAccountWithMneomnic = () => {
    const resp = wallet.createAccountWithMneomnic();
    // const keyObject = encode(resp.privateKey, 'a');
    return {
      privateKey: resp.privateKey,
      address: resp.address,
      mnemonic: resp.mnemonic,
      publicKey: resp.publicKey,
    };
  };

  render() {
    // const { usernameErr, rePassErr, lastnameErr, firstnameErr, passwordErr } = this.state;
    const { username, firstname, lastname, password, rePassword } = this.state;
    const { classes } = this.props;

    return (
      <ValidatorForm onSubmit={this.gotoNext}>
        <TextValidator
          label="Username"
          fullWidth
          onChange={this.handleUsername}
          name="username"
          validators={['required', 'isAliasRegisted']}
          errorMessages={['This field is required', 'Username already exists! Please choose another']}
          margin="normal"
          value={username}
        />
        <FlexBox>
          <TextValidator
            label="First Name"
            fullWidth
            onChange={this.handleUsername}
            name="firstname"
            validators={['required']}
            errorMessages={['This field is required']}
            className={classes.marginRight}
            margin="normal"
            value={firstname}
          />
          <TextValidator
            label="Last Name"
            fullWidth
            onChange={this.handleUsername}
            name="lastname"
            validators={['required']}
            errorMessages={['This field is required']}
            margin="normal"
            value={lastname}
          />
        </FlexBox>
        <TextValidator
          label="Password"
          fullWidth
          onChange={this.handleUsername}
          name="password"
          type="password"
          validators={['required']}
          errorMessages={['This field is required']}
          margin="normal"
          value={password}
        />
        <TextValidator
          label="Repeat password"
          fullWidth
          onChange={this.handleUsername}
          name="rePassword"
          type="password"
          validators={['isPasswordMatch', 'required']}
          errorMessages={['Password mismatch', 'This field is required']}
          margin="normal"
          value={rePassword}
        />
        <DivControlBtnKeystore>
          <LinkPro href="/login">Login</LinkPro>
          <ButtonPro type="submit">
            Next
            <Icon className={classes.rightIcon}>arrow_right_alt</Icon>
          </ButtonPro>
        </DivControlBtnKeystore>
      </ValidatorForm>
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
