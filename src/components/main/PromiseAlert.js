import React from "react";
import styled from "styled-components";
import { makeStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import CustomPost from "./CustomPost";
import CommonDialog from "./CommonDialog";
import { TagTitle } from "./Promise";

const ImgView = styled.div`
  margin: 31px 0 31px;
`;

class PromiseAlert extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      smt: ""
    };
  }
  render() {
    const { deny, close, accept } = this.props;
    return (
      <CommonDialog
        title="Promise alert"
        okText="Accept"
        cancelText="Deny"
        close={close}
        cancel={deny}
        confirm={accept}
        isCancel
      >
        <TagTitle>John Smith send you a promise</TagTitle>
        <ImgView>
          <img src="/static/img/promiseAlert.jpeg" className="postImg" />
        </ImgView>
        <p>
          No one needs to count material wealth when they have a friend like
          you. You are the most wonderful friend I could ever wish for. I wish
          you a very happy friendship day.
        </p>
      </CommonDialog>
    );
  }
}

PromiseAlert.defaultProps = {
  deny() {},
  accept() {},
  close() {}
};

export default PromiseAlert;
