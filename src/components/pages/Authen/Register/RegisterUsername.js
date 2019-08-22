import React, { PureComponent } from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { callView, isAliasRegisted, wallet } from '../../../../helper';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Icon from '@material-ui/core/Icon';
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
});

class RegisterUsername extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      rePassErr: '',
      username: '',
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
    const { setUsername, setStep, setLoading, setAccount } = this.props;

    if (username) {
      const resp = await isAliasRegisted(username);
      if (resp) {
        this.setState({
          rePassErr: 'Username already exists! Please choose another',
        });
      } else {
        setLoading(true);
        setTimeout(async () => {
          const account = await this._createAccountWithMneomnic();
          setAccount({
            privateKey: account.privateKey,
            mnemonic: account.mnemonic,
            address: account.address,
            step: 'two',
            username: username,
          });
          // setLoading(false);
        }, 500);
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
    const { rePassErr } = this.state;
    const { classes } = this.props;

    return (
      <div>
        <TextField
          id="username"
          label="Username"
          placeholder="Enter your username"
          helperText={rePassErr}
          error={rePassErr !== ''}
          fullWidth
          margin="normal"
          onChange={this.handleUsername}
        />
        <DivControlBtnKeystore>
          <Button color="primary" href="/login" className={classes.link}>
            Login
          </Button>
          <Button variant="contained" color="primary" className={classes.button} onClick={this.gotoNext}>
            Next
            <Icon className={classes.rightIcon}>arrow_right_alt</Icon>
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
  )(RegisterUsername)
);
