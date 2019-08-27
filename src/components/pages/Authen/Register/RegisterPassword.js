import React, { PureComponent } from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { registerAlias, setTagsInfo } from '../../../../helper';
import { withStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { DivControlBtnKeystore, FlexBox, FlexWidthBox, rem } from '../../../elements/Common';
import * as actionGlobal from '../../../../store/actions/globalData';
import * as actionAccount from '../../../../store/actions/account';
import * as actionCreate from '../../../../store/actions/create';
import { encode } from '../../../../helper';
// import notifi from '../../../elements/Notification';

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
      displayname: props.username,
    };
  }
  componentDidMount() {
    window.document.body.addEventListener('keydown', this._keydown);
  }
  componentWillUnmount() {
    window.document.body.removeEventListener('keydown', this._keydown);
  }
  _keydown = e => {
    e.keyCode === 13 && this.gotoRegister();
  };
  gotoRegister = async () => {
    const { password, displayname } = this.state;
    const { history, username, address, privateKey } = this.props;
    const { setAccount, setLoading, setStep } = this.props;
    // console.log('username', username, address);
    const resp = await registerAlias(username, address, privateKey);
    const respTags = await setTagsInfo(address, 'display-name', displayname);
    console.log('respTags', respTags);
    if (resp) {
      setLoading(true);
      setTimeout(async () => {
        const keyObject = encode(privateKey, password);
        console.log('keyObject', keyObject);
        const account = { address, privateKey, cipher: keyObject };
        setAccount(account);
        localStorage.removeItem('user');
        localStorage.setItem('user', JSON.stringify({ address, keyObject, privateKey }));
        setLoading(false);
        // history.push('/');
        setStep('three');
      }, 500);
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
  handleDisplayname = event => {
    const displayname = event.target.value;
    // console.log(value);
    this.setState({ displayname });
  };
  render() {
    const { rePassErr, displayname, showPassword, sex } = this.state;
    const { classes, address, privateKey, mnemonic, username } = this.props;

    return (
      <div>
        <FlexBox wrap="wrap" width="800px">
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
              id="displayname"
              value={displayname}
              label="Display Name"
              placeholder="Enter your display name"
              fullWidth
              margin="normal"
              onChange={this.handleDisplayname}
            />
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
        </FlexBox>
        <DivControlBtnKeystore>
          <Button color="primary" className={classes.link} onClick={this.gotoBack}>
            Back
          </Button>
          <Button variant="contained" color="primary" className={classes.button} onClick={this.gotoRegister}>
            Register
          </Button>
        </DivControlBtnKeystore>
      </div>
    );
  }
}

const mapStateToProps = state => {
  const e = state.account;
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
  )(withRouter(RegisterPassword))
);
