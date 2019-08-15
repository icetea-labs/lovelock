import React from "react";
import styled from "styled-components";
import { makeStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import CustomPost from "./CustomPost";
import CommonDialog from "./CommonDialog";
import tweb3 from "../../service/tweb3";

const useStyles = makeStyles(theme => ({
  container: {
    display: "flex",
    flexWrap: "wrap"
  },
  textField: {
    marginLeft: theme.spacing(0),
    marginRight: theme.spacing(1),
    marginBottom: theme.spacing(4)
  },
  textMulti: {
    marginLeft: theme.spacing(0),
    marginRight: theme.spacing(1),
    marginBottom: theme.spacing(1)
  }
}));

function TextFieldPlaceholder(props) {
  const classes = useStyles();
  return <TextField className={classes.textField} {...props} />;
}

function TextFieldMultiLine(props) {
  const classes = useStyles();
  return <TextField className={classes.textMulti} {...props} />;
}

export const TagTitle = styled.div`
  width: 225px;
  height: 18px;
  font-family: Montserrat;
  font-size: 14px;
  font-weight: 500;
  font-style: normal;
  font-stretch: normal;
  line-height: normal;
  letter-spacing: normal;
  color: #141927;
`;
class Promise extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      partner: "",
      promiseStm: ""
    };
  }

  partnerChange = e => {
    const value = e.target.value;
    this.setState({
      partner: value
    });
    // console.log("view partnerChange", value);
  };

  promiseStmChange = e => {
    const value = e.target.value;
    this.setState({
      promiseStm: value
    });
    // console.log("view promiseStmChange", value);
  };

  async createPropose(partner, promiseStm) {
    // console.log("partner", partner);
    // console.log("promiseStm", promiseStm);
    const ct = tweb3.contract(process.env.REACT_APP_CONTRACT);
    // const { address } = tweb3.wallet.createAccount();
    const info = "abcxyz";
    const name = "createPropose";
    const result = await ct.methods[name](
      promiseStm,
      partner,
      info
    ).sendCommit();
    // console.log("View result", result);
    if (result) {
      window.alert("send success");
    }
    this.props.close();
  }

  render() {
    const { send, close } = this.props;
    const { partner, promiseStm } = this.state;
    // console.log("State CK", this.state);

    return (
      <CommonDialog
        title="Promise"
        okText="Send"
        close={close}
        confirm={() => {
          this.createPropose(partner, promiseStm);
        }}
      >
        <TagTitle>Tag your partner you promise</TagTitle>
        <TextFieldPlaceholder
          id="outlined-helperText"
          placeholder="@partner"
          margin="normal"
          variant="outlined"
          fullWidth
          onChange={this.partnerChange}
        />
        <TagTitle>Your promise</TagTitle>
        <TextFieldMultiLine
          id="outlined-multiline-static"
          placeholder="your promise ..."
          multiline
          fullWidth
          rows="5"
          margin="normal"
          variant="outlined"
          onChange={this.promiseStmChange}
        />
        <CustomPost />
      </CommonDialog>
    );
  }
}

Promise.defaultProps = {
  send() {},
  close() {}
};

export default Promise;
