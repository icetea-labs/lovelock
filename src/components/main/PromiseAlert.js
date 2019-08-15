import React from "react";
import styled from "styled-components";
import CommonDialog from "./CommonDialog";
import { TagTitle } from "./Promise";
// import PromiseConfirm from "./PromiseConfirm";
import { callView, getAccountInfo, getTagsInfo } from "../../helper";

const ImgView = styled.div`
  margin: 31px 0 31px;
`;

class PromiseAlert extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      sender: "",
      info: "",
      content: ""
    };
  }

  componentDidMount() {
    this.loaddata();
  }

  async loaddata() {
    let { propose, address } = this.props;
    const { index } = this.props;

    const obj = propose[index];
    console.log("view obj", obj);
    if (obj.status === 0) {
      const addr = address === obj.sender ? obj.receiver : obj.sender;
      const reps = await getTagsInfo(addr);
      obj.name = reps["display-name"];
      this.setState({
        sender: obj.name,
        info: obj.info,
        content: obj.s_content
      });
    }
  }

  render() {
    const { deny, close, accept, index } = this.props;
    const { sender, info, content } = this.state;
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
          <TagTitle>{sender} send you a promise</TagTitle>
          <ImgView>
            <img src="/static/img/promiseAlert.jpeg" className="postImg" />
          </ImgView>
          <p>{content}</p>
        </CommonDialog>
        {/* {isAccept && <PromiseConfirm close={this.closeConfirm} />} */}
      </div>
    );
  }
}

PromiseAlert.defaultProps = {
  index: 0,
  deny() {},
  accept() {},
  close() {}
};

export default PromiseAlert;
