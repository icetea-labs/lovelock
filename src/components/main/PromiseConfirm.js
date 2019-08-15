import React from "react";
import styled from "styled-components";
import { makeStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import CommonDialog from "./CommonDialog";
import { TagTitle } from "./Promise";
import tweb3 from "../../service/tweb3";
import { callView } from "../../helper";

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
      message: ""
    };
  }

  messageChange = e => {
    const value = e.target.value;
    this.setState({
      message: value
    });
  };

  async messageAccept(message) {
    const { index } = this.props;
    try {
      const ct = tweb3.contract(process.env.contract);
      const name = "acceptPropose";
      const result = await ct.methods[name](index, message).sendCommit();
      console.log("View result", result);
      if (result) {
        // window.alert("send success");
        this.props.close();
      }
    } catch (error) {
      console.log(error);
    }
  }

  render() {
    const { close, send, isDeny } = this.props;
    const { message } = this.state;
    return (
      <CommonDialog
        title="Promise alert"
        okText="Send"
        cancelText="Cancel"
        close={close}
        cancel={close}
        confirm={() => {
          this.messageAccept(message);
        }}
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
          onChange={this.messageChange}
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
  index: 0,
  send() {},
  close() {}
};

export default PromiseConfirm;
