import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import { connect } from 'react-redux';
import { withSnackbar } from 'notistack';

import CommonDialog from './CommonDialog';
import { TagTitle } from './PuNewLock';
import { sendTxWithAuthen } from '../../helper/hooks';
import { handleError } from '../../helper';

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

class PuConfirmLock extends React.Component {
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
    const { index, enqueueSnackbar, close } = this.props;

    try {
      const result = await sendTxWithAuthen(this.props, 'acceptLock', index, message);
      if (result) {
        const errMessage = 'Your lock has been confirmed.';
        enqueueSnackbar(errMessage, { variant: 'success' });
        close();
      }
    } catch (err) {
      const msg = handleError(err, 'sendding accept lock');
      enqueueSnackbar(msg, { variant: 'error' });
    }
  }

  async messageDeny(message) {
    const { index, enqueueSnackbar, close } = this.props;
    try {
      const result = await sendTxWithAuthen(this.props, 'cancelLock', index, message);

      if (result) {
        // window.alert('Success');
        const errMessage = 'Your lock has been rejected.';
        enqueueSnackbar(errMessage, { variant: 'info' });
        close();
      }
    } catch (err) {
      const msg = handleError(err, 'sendding deny lock');
      enqueueSnackbar(msg, { variant: 'error' });
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
            autoFocus
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
              autoFocus
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

PuConfirmLock.defaultProps = {
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
)(withSnackbar(PuConfirmLock));
