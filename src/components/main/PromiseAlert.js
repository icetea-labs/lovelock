import React from "react";
import styled from "styled-components";
import CommonDialog from "./CommonDialog";
import { TagTitle } from "./Promise";
// import PromiseConfirm from "./PromiseConfirm";

const ImgView = styled.div`
  margin: 31px 0 31px;
`;

class PromiseAlert extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isAccept: false
    };
  }

  // acceptPromise = () => {
  //   this.setState({ isAccept: true });
  // };

  // closeConfirm = () => {
  //   this.setState({ isAccept: false });
  // }

  render() {
    const { deny, close, accept } = this.props;
    const { isAccept } = this.state;
    return (
      <div>
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
        {/* {isAccept && <PromiseConfirm close={this.closeConfirm} />} */}
      </div>
    );
  }
}

PromiseAlert.defaultProps = {
  deny() {},
  accept() {},
  close() {}
};

export default PromiseAlert;
