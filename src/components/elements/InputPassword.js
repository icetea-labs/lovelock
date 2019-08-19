import React, { PureComponent } from "react";
import styled from "styled-components";
// import { Icon } from "./utils";
import { zIndex } from "./Styled";

const Container = styled.div`
  margin-top: 20px;
  position: relative;
  .inputWrap {
    position: relative;
    z-index: ${zIndex.input};
  }
  input {
    border: none;
    border-radius: 0;
    width: 100%;
    height: 100%;
    outline: none;
    font-size: 14px;
    border-bottom: 1px solid ${props => props.borderColor};
    caret-color: #15b5dd;
    padding: 0;
    padding-bottom: 10px;
    color: ${props => props.theme.fontColor};
    background: inherit;
    position: relative;
    &:focus {
      border-color: #15b5dd;
    }
  }
  .label {
    font-size: 16px;
    position: absolute;
    transform: translateY(0px);
    transition: all 0.2s ease;
    z-index: ${zIndex.inputLabel};
    color: #848e9c;
  }
  .label-value {
    transform: translateY(-20px);
    color: ${props => props.theme.fontColor};
    font-size: 12px;
  }
`;
const DivRulePassword = styled.div`
  margin-top: 5px;
  background: #fbfbfb;
  padding: 10px;
  border: 1px solid rgba(234, 236, 239, 0.5);
  .text {
    font-size: 14px;
    color: ${props => props.theme.fontColor};
    line-height: 14px;
    margin-bottom: 10px;
  }
  ul {
    color: #263147;
    display: flex;
    justify-content: flex-start;
    padding-left: 15px;
    li {
      position: relative;
      font-size: 12px;
      white-space: nowrap;
      &:first-child {
        margin-right: 60px;
      }
      &:before {
        content: "";
        position: absolute;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #848e9c;
        top: 5px;
        left: -15px;
        transition: background 0.25s ease;
      }
    }
    li.pass {
      &:before {
        background: #00c087;
      }
    }
    li.invalid {
      color: #f23051;
      &:before {
        background: #f23051;
      }
    }
    @media (min-width: 320px) and (max-width: 623px) {
      flex-direction: column;
    }
  }
`;
const WrapperEye = styled.div`
  position: absolute;
  right: 0;
  top: 0;
  color: ${props => props.theme.fontColor};
  cursor: pointer;
`;
const WrapperClear = styled.div`
  position: absolute;
  right: 25px;
  top: 0;
  color: ${props => props.theme.fontColor};
  cursor: pointer;
`;

class InputPassword extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      // agree: false,
      password: "",
      showPassword: false
    };
  }

  _clear = () => {
    const { props } = this;
    this.setState({ password: "" }, () => props.onChange("", false));
  };

  _showPassword = () => {
    const { showPassword } = this.state;
    this.setState({
      showPassword: !showPassword
    });
  };

  _passwordChange = event => {
    const { props } = this;
    const value = event.currentTarget.value.trim();
    const regex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#])"); // [!@#\$%\^&\*]
    const classRule1 = value
      ? value.length >= 8
        ? "pass"
        : "invalid"
      : "empty";
    const classRule2 = value
      ? regex.test(value)
        ? "pass"
        : "invalid"
      : "empty";
    this.setState({ password: value }, () =>
      props.onChange(value, classRule1 === "pass" && classRule2 === "pass")
    );
  };

  render() {
    const { password, showPassword } = this.state;
    const { withRules, warning, title, autoFocus } = this.props;
    const regex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#])"); // [!@#\$%\^&\*]
    const classRule1 = password
      ? password.length >= 8
        ? "pass"
        : "invalid"
      : "empty";
    const classRule2 = password
      ? regex.test(password)
        ? "pass"
        : "invalid"
      : "empty";

    return (
      <Container
        borderColor={warning ? "rgba(242,48,81,0.5)" : "rgba(234,236,239,0.5)"}
      >
        <p className={password ? "label label-value" : "label"}>{title}</p>
        <div className="inputWrap">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            autoFocus={autoFocus}
            autoComplete="off"
            value={password}
            onChange={this._passwordChange}
          />
          <WrapperEye onClick={this._showPassword}>
            {/* <Icon type={showPassword ? "eye" : "blind-eye"} size="14" /> */}
          </WrapperEye>
          <WrapperClear onClick={this._clear}>
            {/* {password && <Icon type="clear" size="14" />} */}
          </WrapperClear>
        </div>
        {withRules && (
          <DivRulePassword>
            <div className="text">
              Your password must include the following properties:{" "}
            </div>
            <ul>
              <li className={classRule1}>8 or more characters</li>
              <li className={classRule2}>
                An upper-case letter, symbol and a number
              </li>
            </ul>
          </DivRulePassword>
        )}
      </Container>
    );
  }
}

InputPassword.defaultProps = {
  onChange() {},
  withRules: true,
  autoFocus: false,
  warning: false,
  title: "Set a New Password"
};

export { InputPassword };
export default InputPassword;
