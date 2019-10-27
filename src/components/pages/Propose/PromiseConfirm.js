import React from 'react';
import styled from 'styled-components';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import { connect } from 'react-redux';
import { withSnackbar } from 'notistack';
import CommonDialog from './CommonDialog';
import { TagTitle } from './PuNewLock';
import { sendTransaction } from '../../../helper/index';

const useStyles = makeStyles(theme => ({
  textMulti: {
    marginLeft: theme.spacing(0),
    marginRight: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
}));

function TextFieldMultiLine(props) {
  const classes = useStyles();
  return <TextField className={classes.textMulti} {...props} />;
}

class PromiseConfirm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      messageAccept: '',
      messageDeny: '',
    };
  }

  messageAcceptChange = e => {
    const val = e.target.value;
    this.setState({
      messageAccept: val,
    });
  };

  messageDenyChange = e => {
    const val = e.target.value;
    this.setState({
      messageDeny: val,
    });
  };

  async messageAccept(message) {
    const { index, enqueueSnackbar, close, address, tokenAddress } = this.props;
    // console.log('view confirm props', this.props);
    try {
      const name = 'acceptPropose';
      const params = [index, message];
      const result = await sendTransaction(name, params, { address, tokenAddress });
      if (result) {
        const errMessage = 'Your lock has been confirmed.';
        enqueueSnackbar(errMessage, { variant: 'success' });
        close();
      }
    } catch (error) {
      console.error(error);
    }
  }

  async messageDeny(message) {
    const { index, enqueueSnackbar, close, address, tokenAddress } = this.props;
    try {
      const name = 'cancelPropose';
      const params = [index, message];
      const result = await sendTransaction(name, params, { address, tokenAddress });
      // console.log('View result', result);
      if (result) {
        // window.alert('Success');
        const errMessage = 'Your lock has been rejected.';
        enqueueSnackbar(errMessage, { variant: 'info' });
        close();
      }
    } catch (error) {
      console.error(error);
    }
  }

  render() {
    const { close, isDeny } = this.props;
    const { messageAccept, messageDeny } = this.state;
    return (
      <CommonDialog
        title="Lock alert"
        okText="Send"
        cancelText="Cancel"
        close={close}
        cancel={close}
        confirm={() => {
          if (!isDeny) {
            this.messageAccept(messageAccept);
          } else {
            this.messageDeny(messageDeny);
          }
        }}
        isCancel
      >
        <TagTitle>{isDeny ? 'Your message (optional)' : 'Your message'}</TagTitle>
        {isDeny ? (
          <TextFieldMultiLine
            id="outlined-multiline-static"
            placeholder="I don’t care"
            multiline
            fullWidth
            rows="5"
            margin="normal"
            variant="outlined"
            onChange={this.messageDenyChange}
          />
        ) : (
          <div>
            <TextFieldMultiLine
              id="outlined-multiline-static"
              placeholder="Like your lock"
              multiline
              fullWidth
              rows="5"
              margin="normal"
              variant="outlined"
              onChange={this.messageAcceptChange}
            />
            {/* <IconView>
              <i className="material-icons">insert_photo</i>
            </IconView> */}
          </div>
        )}
      </CommonDialog>
    );
  }
}

PromiseConfirm.defaultProps = {
  isDeny: false,
  index: -1,
  send() {},
  close() {},
};

const mapStateToProps = state => {
  return {
    address: state.account.address,
    tokenAddress: state.account.tokenAddress,
    tokenKey: state.account.tokenKey,
  };
};

export default connect(
  mapStateToProps,
  null
)(withSnackbar(PromiseConfirm));
