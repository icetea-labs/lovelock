import React, { PureComponent } from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import tweb3 from 'src/service/tweb3';
import { callView, isAliasRegisted, getTagsInfo } from 'src/helper';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Icon from '@material-ui/core/Icon';
import * as acGlobal from 'src/store/actions/globalData';
import * as actions from 'src/store/actions/create';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';

import { DivControlBtnKeystore, FlexBox, FlexWidthBox, rem } from 'src/components/elements/Common';
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
    font-size: 0.9rem;
    font-weight: 400;
  }
`;

class RegisterPassword extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      rePassErr: '',
      username: '',
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
    e.keyCode === 13 && this.gotoNext();
  };
  gotoNext = async () => {
    const { username } = this.state;
    const { setUsername, setStep } = this.props;

    if (username) {
      const resp = await isAliasRegisted(username);
      if (resp) {
        this.setState({
          rePassErr: 'Username already exists! Please choose another',
        });
      } else {
        setUsername(username);
        setStep('inputPassword');
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
    setStep('inputUsername');
  };
  render() {
    const { rePassErr, showPassword, password, selectedDate, sex } = this.state;
    const { classes } = this.props;

    return (
      <FlexBox wrap="wrap" width="900px">
        <FlexWidthBox width="60%">
          <WrapperLeftBox>
            <p className="titleKey">Address:</p>
            <FlexBox justify="space-between">
              <code>0xbc9a72ae3a7ecfdb27a419f8269daeff19271366</code>
              <i className="material-icons">file_copy</i>
            </FlexBox>
            <p className="titleKey">Private key:</p>
            <FlexBox justify="space-between">
              <code>286d9c217c0a9a89c47123b665098f0e47a42b5e06d22f0fa3e30872e87184a7</code>
              <i className="material-icons">file_copy</i>
            </FlexBox>
            <p className="titleKey">Mnemonic phrase:</p>
            <FlexBox justify="space-between">
              <code>current hurdle siege mango link obey roof voice weasel quality secret dentist</code>
              <i className="material-icons">file_copy</i>
            </FlexBox>
            <p className="txNote">
              * Private key is generated from client side and cannot restore once lost. Please backup private
              key/mnemonic carefully.
            </p>
          </WrapperLeftBox>
        </FlexWidthBox>
        <FlexWidthBox width="40%">
          <TextField id="username" label="Username" value="hoanghuy" disabled fullWidth margin="normal" />
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
            placeholder="Confirm your Password"
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
          <Button variant="contained" color="primary" className={classes.button} onClick={this.gotoNext}>
            Register
          </Button>
        </DivControlBtnKeystore>
      </FlexBox>
    );
  }
}

const mapStateToProps = state => {
  return {
    password: state.create.password,
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
    // setAccount: value => {
    //   dispatch(actions.setAccount(value));
    // },
    setStep: value => {
      dispatch(actions.setStep(value));
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
