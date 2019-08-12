import React from "react";
import styled from "styled-components";
import { rem } from "../elements/Common";
import TextField, { HelperText, Input } from "@material/react-text-field";
// import "@material/react-text-field/dist/text-field.css";
// import MaterialIcon from '@material/react-material-icon';

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
            <TextField
              onTrailingIconSelect={() => this.setState({ value: "" })}
              // trailingIcon={<MaterialIcon role="button" icon="delete" />}
            >
              <Input
                value={this.state.value}
                onChange={e => this.setState({ value: e.currentTarget.value })}
              />
            </TextField>
          </ContWrap>
        </Container>
      </PuLayout>
    );
  }
}

export default Promise;
