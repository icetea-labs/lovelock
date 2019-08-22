import React, { PureComponent } from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { callView, isAliasRegisted, registerAlias } from '../../../../helper';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Icon from '@material-ui/core/Icon';
// import * as acGlobal from 'src/store/actions/globalData';
// import * as actions from 'src/store/actions/create';
// import * as actionsAccount from 'src/store/actions/account';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';

import { DivControlBtnKeystore, FlexBox, FlexWidthBox, rem } from '../../../elements/Common';
// import "date-fns";
// import DateFnsUtils from "@date-io/date-fns";
// import {
//   MuiPickersUtilsProvider,
//   KeyboardDatePicker
// } from "@material-ui/pickers";

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
  group: {
    margin: theme.spacing(1, 0),
    display: 'flex',
    flexDirection: 'row',
  },
  radio: {
    // color: '#fe8dc3',
  },
});

const WrapperLeftBox = styled.div`
  padding: ${rem(15)} ${rem(40)} ${rem(20)} ${rem(10)};
  p {
    margin: ${rem(5)} 0;
  }
  i {
    margin: 0 ${rem(7)};
    cursor: pointer;
  }
  code {
    word-break: break-word;
    color: #00f;
  }
  .titleKey {
    font-weight: 600;
    margin-top: ${rem(15)};
  }
  .txNote {
    margin: ${rem(20)} 0;
    font-style: italic;
    color: red;
    font-size: 0.8rem;
    font-weight: 400;
  }
`;

class RegisterPassword extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      rePassErr: '',
      password: '',
      showPassword: false,
      selectedDate: new Date(),
      sex: '',
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
    e.keyCode === 13 && this.gotoRegister();
  };
  gotoRegister = async () => {
    const { password } = this.state;
    const { setAccount, setStep, username, address, privateKey } = this.props;
    // console.log('username', username, address);
    const resp = await registerAlias(username, address, privateKey);
    if (resp) {
      const account = { address, privateKey, cipher: password };
      setAccount(account);
      localStorage.removeItem('user');
      localStorage.setItem('user', JSON.stringify({ address, privateKey }));
      window.location.pathname = '/timeline';
      // Router.push('/timeline');
    }
    console.log('resp', resp);
  };

  handlePassword = event => {
    const password = event.target.value;
    // console.log(value);
    this.setState({ password });
  };
  handleClickShowPassword = () => {
    const { showPassword } = this.state;
    this.setState({ showPassword: !showPassword });
  };
  handleMouseDownPassword = () => {
    // event.preventDefault();
  };
  handleDateChange = () => {};
  handleChangeSex = event => {
    this.setState({ sex: event.target.value });
  };

  gotoBack = () => {
    const { setStep } = this.props;
    setStep('one');
  };
  render() {
    const { rePassErr, showPassword, password, selectedDate, sex } = this.state;
    const { classes, address, privateKey, mnemonic, username } = this.props;

    return (
      <FlexBox wrap="wrap" width="900px">
        <FlexWidthBox width="60%">
          <WrapperLeftBox>
            <p className="titleKey">Address:</p>
            <FlexBox justify="space-between">
              <code>{address}</code>
              <i className="material-icons">file_copy</i>
            </FlexBox>
            <p className="titleKey">Private key:</p>
            <FlexBox justify="space-between">
              <code>{privateKey}</code>
              <i className="material-icons">file_copy</i>
            </FlexBox>
            <p className="titleKey">Mnemonic phrase:</p>
            <FlexBox justify="space-between">
              <code>{mnemonic}</code>
              <i className="material-icons">file_copy</i>
            </FlexBox>
            <p className="txNote">
              * Private key is generated from client side and cannot restore once lost. Please backup private
              key/mnemonic carefully.
            </p>
          </WrapperLeftBox>
        </FlexWidthBox>
        <FlexWidthBox width="40%">
          <TextField id="username" label="Username" value={username} disabled fullWidth margin="normal" />
          <TextField
            id="password"
            label="Password"
            placeholder="Password"
            helperText={rePassErr}
            error={rePassErr !== ''}
            fullWidth
            margin="normal"
            onChange={this.handleUsername}
            type={showPassword ? 'text' : 'password'}
          />
          <TextField
            id="rePassword"
            label="Confirm Password"
            placeholder="Confirm your password"
            helperText={rePassErr}
            error={rePassErr !== ''}
            fullWidth
            margin="normal"
            onChange={this.handleUsername}
            type={showPassword ? 'text' : 'password'}
          />
          <RadioGroup
            aria-label="gender"
            name="gender1"
            className={classes.group}
            value={sex}
            onChange={this.handleChangeSex}
          >
            <FormControlLabel value="female" control={<Radio className={classes.radio} />} label="Female" />
            <FormControlLabel value="male" control={<Radio className={classes.radio} />} label="Male" />
          </RadioGroup>
          {/* <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <KeyboardDatePicker
              disableToolbar
              variant="inline"
              format="MM/dd/yyyy"
              margin="normal"
              id="date-picker-inline"
              label="Date picker inline"
              value={selectedDate}
              onChange={this.handleDateChange}
              KeyboardButtonProps={{
                "aria-label": "change date"
              }}
            />
          </MuiPickersUtilsProvider> */}
        </FlexWidthBox>
        <DivControlBtnKeystore>
          <Button color="primary" className={classes.link} onClick={this.gotoBack}>
            Back
          </Button>
          <Button variant="contained" color="primary" className={classes.button} onClick={this.gotoRegister}>
            Register
          </Button>
        </DivControlBtnKeystore>
      </FlexBox>
    );
  }
}

const mapStateToProps = state => {
  const e = state.create;
  return {
    username: e.username,
    password: e.password,
    privateKey: e.privateKey,
    address: e.address,
    mnemonic: e.mnemonic,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    // setPassword: value => {
    //   dispatch(actions.setPassword(value));
    // },
    setAccount: value => {
      // dispatch(actionsAccount.setAccount(value));
    },
    setStep: value => {
      // dispatch(actions.setStep(value));
    },
    // setLoading: value => {
    //   dispatch(acGlobal.setLoading(value));
    // }
  };
};

export default withStyles(styles)(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(RegisterPassword)
);
