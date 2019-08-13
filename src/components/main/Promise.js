import React from "react";
import styled from "styled-components";
import QueueAnim from "rc-queue-anim";
import { rem } from "../elements/Common";
import { makeStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import CustomPost from "./CustomPost";

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

const PuLayout = styled.div`
  position: fixed;
  top: 0px;
  left: 0px;
  right: 0px;
  bottom: 0px;
  z-index: 1;
  background: rgba(0, 0, 0, 0.5);
`;

const Container = styled.div`
  width: 600px;
  height: 602px;
  border-radius: 10px;
  box-shadow: 0 14px 52px 0 rgba(0, 0, 0, 0.12);
  background-color: #ffffff;
  /* padding: 10px; */
  box-sizing: border-box;
  background: ${props => props.theme.popupBg};
  box-shadow: ${props => props.theme.boxShadow};
  position: fixed;
  top: 10%;
  left: 50%;
  transform: translate(-50%, -50%);
  @media (max-width: 768px) {
    width: 100%;
    min-width: 300px;
    max-width: 300px;
    padding: 15px;
    top: 20%;
  }
`;

const PuTitle = styled.div`
  display: flex;
  width: 600px;
  height: 62px;
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
  padding: 10px;
  box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.05);
  background-color: #8250c8;
  font-family: Montserrat;
  font-size: 18px;
  font-weight: 600;
  font-style: normal;
  font-stretch: normal;
  line-height: normal;
  letter-spacing: normal;
  color: #ffffff;
  padding: 0 20px;
  align-items: center;
  justify-content: space-between;
  .title {
    margin-left: 8px;
  }
`;

const ContWrap = styled.div`
  width: 100%;
  height: 90%;
  padding: 30px;
`;

const TagTitle = styled.div`
  width: 212px;
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

const Action = styled.div`
  .action {
    width: 100%;
    margin: 40px 0 16px;
    justify-content: center;
    display: flex;
    button {
      width: 172px;
      line-height: 46px;
      font-size: 16px;
      color: #ffffff;
      font-weight: 600;
      border-radius: 23px;
      /* box-shadow: 0 5px 14px 0 rgba(0, 0, 0, 0.06); */
      background-image: linear-gradient(340deg, #b276ff, #fe8dc3);
    }
  }
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

  render() {
    const { send, close } = this.props;
    const { partner, promiseStm } = this.state;
    // console.log("State CK", this.state);

    return (
      <QueueAnim animConfig={{ opacity: [1, 0] }}>
        <PuLayout key={1}>
          <QueueAnim leaveReverse delay={100} type={["top", "bottom"]}>
            <Container key={2}>
              <PuTitle>
                <span className="title">Promise</span>
                <i className="material-icons" onClick={close}>
                  close
                </i>
              </PuTitle>
              <ContWrap>
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
                <Action>
                  <div className="action">
                    <button type="button" disabled="" onClick={send}>
                      Send
                    </button>
                  </div>
                </Action>
              </ContWrap>
            </Container>
          </QueueAnim>
        </PuLayout>
      </QueueAnim>
    );
  }
}

Promise.defaultProps = {
  send() {},
  close() {}
};

export default Promise;
