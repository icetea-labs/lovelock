import React from "react";
import styled from "styled-components";
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

function TextFieldPlaceholder() {
  const classes = useStyles();
  return (
    <TextField
      id="outlined-helperText"
      className={classes.textField}
      placeholder="@partner"
      margin="normal"
      variant="outlined"
      fullWidth
    />
  );
}

function TextFieldMultiLine() {
  const classes = useStyles();
  return (
    <TextField
      id="outlined-multiline-static"
      placeholder="your promise ..."
      multiline
      fullWidth
      rows="5"
      className={classes.textMulti}
      margin="normal"
      variant="outlined"
    />
  );
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
  top: 50%;
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
      smt: ""
    };
  }

  render() {
    return (
      <PuLayout>
        <Container>
          <PuTitle>
            <span className="title">Promise</span>
            <i class="material-icons">close</i>
          </PuTitle>
          <ContWrap>
            <TagTitle>Tag your partner you promise</TagTitle>
            <TextFieldPlaceholder />
            <TagTitle>Your promise</TagTitle>
            <TextFieldMultiLine />
            <CustomPost />
            <Action>
              <div className="action">
                <button type="button" disabled="">
                  Send
                </button>
              </div>
            </Action>
          </ContWrap>
        </Container>
      </PuLayout>
    );
  }
}

export default Promise;
