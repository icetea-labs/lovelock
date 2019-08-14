import React from "react";
import styled from "styled-components";
import { makeStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import CommonDialog from "./CommonDialog";
import { TagTitle } from "./Promise";

const useStyles = makeStyles(theme => ({
  textMulti: {
    marginLeft: theme.spacing(0),
    marginRight: theme.spacing(1),
    marginBottom: theme.spacing(1)
  }
}));

function TextFieldMultiLine(props) {
  const classes = useStyles();
  return <TextField className={classes.textMulti} {...props} />;
}

const IconView = styled.div`
  color: #8250c8;
`;

class PromiseConfirm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      smt: ""
    };
  }
  render() {
    const { close, send, isDeny } = this.props;
    return (
      <CommonDialog
        title="Promise alert"
        okText="Send"
        cancelText="Cancel"
        close={close}
        cancel={close}
        confirm={send}
        isCancel
      >
        <TagTitle>
          {isDeny ? "Your message (optional)" : "Your message"}
        </TagTitle>

        <TextFieldMultiLine
          id="outlined-multiline-static"
          placeholder="Like your promise"
          multiline
          fullWidth
          rows="5"
          margin="normal"
          variant="outlined"
          onChange={this.promiseStmChange}
        />
        <IconView>
          <i className="material-icons">insert_photo</i>
        </IconView>
      </CommonDialog>
    );
  }
}

PromiseConfirm.defaultProps = {
  isDeny: false,
  send() {},
  close() {}
};

export default PromiseConfirm;
