import React, { PureComponent } from "react";
import styled from "styled-components";
import { FlexBox, FlexWidthBox, rem } from "../elements/Common";
import { callView, getAccountInfo, getTagsInfo } from "../../helper";

const WarrperAcceptedPromise = styled.div`
  display: flex;
  align-items: flex-start;
  margin-bottom: ${rem(20)};
  :hover {
    cursor: pointer;
    background: #f5f2f0;
    border-radius: 5px;
  }
  .icon {
    width: ${rem(36)};
    height: ${rem(36)};
    margin-right: ${rem(10)};
    border-radius: 50%;
    overflow: hidden;
  }
  .name {
    color: #5a5e67;
  }
  .nick {
    color: #8250c8;
    font-size: ${rem(12)};
  }
`;

class PromiseLeftPending extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      basePropose: [],
      newPropose: [],
      index: ""
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const { propose } = nextProps;
    if (JSON.stringify(propose) !== JSON.stringify(prevState.basePropose)) {
      return { basePropose: propose };
    }
    return null;
  }

  componentDidMount() {
    this.loaddata();
  }

  componentDidUpdate(prevProps, prevState) {
    const { basePropose } = this.state;

    if (JSON.stringify(prevState.basePropose) !== JSON.stringify(basePropose)) {
      this.loaddata();
    }
  }

  async loaddata() {
    let { propose, address } = this.props;
    console.log("check propose", propose);
    let tmp = [];
    if (!propose) propose = [];
    for (let i = 0; i < propose.length; i++) {
      const obj = propose[i];
      if (obj.status === 0) {
        const addr = address === obj.sender ? obj.receiver : obj.sender;
        const reps = await getTagsInfo(addr);
        obj.name = reps["display-name"];
        obj.nick = "@" + reps.username;
        obj.index = i;
        tmp.push(obj);
      }
    }

    this.setState({ newPropose: tmp });
  }

  render() {
    const { newPropose } = this.state;
    const { openPendingPromise } = this.props;

    return newPropose.map(item => {
      return (
        <WarrperAcceptedPromise
          key={item.index}
          onClick={() => {
            this.props.openPendingPromise(item.index);
          }}
        >
          <div className="icon">
            <img src="https://trada.tech/assets/img/logo.svg" alt="echo_bot" />
          </div>
          <div className="pri_info">
            <div className="name">{item.name}</div>
            <div className="nick">{item.nick}</div>
          </div>
        </WarrperAcceptedPromise>
      );
    });
  }
}

export default PromiseLeftPending;
