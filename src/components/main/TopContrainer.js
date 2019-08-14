import React, { PureComponent } from "react";
import styled from "styled-components";
import { FlexBox, FlexWidthBox, rem } from "../elements/Common";
import tweb3 from "../../service/tweb3";

const TopContainerBox = styled.div`
  .top__coverimg {
    width: ${rem(900)};
    height: ${rem(425)};
  }
  .top__title {
    display: flex;
    align-items: center;
    padding: ${rem(20)} 0;
    border-bottom: 1px dashed #ebebeb;
    img {
      padding-right: ${rem(15)};
    }
    .title__content {
      color: #8250c8;
      font-weight: 600;
      width: 100%;
      text-align: left;
    }
    .title__date {
      color: #8f8f8f;
    }
  }
`;
const WarrperChatBox = styled(FlexBox)`
  margin-top: ${rem(35)};
  /* & > div:first-child {
    padding-right: ${rem(15)};
  } */
  div:nth-child(even) .content_detail p {
    background-image: -webkit-linear-gradient(128deg, #ad76ff, #8dc1fe);
    background-image: linear-gradient(322deg, #ad76ff, #8dc1fe);
  }
  .user_photo {
    display: block;
    width: 58px;
    height: 58px;
    border-radius: 10px;
    overflow: hidden;
  }
  .name_time {
    .user_name {
      font-weight: 600;
      text-transform: capitalize;
      color: #8250c8;
      width: 100%;
    }
    .time {
      font-size: ${rem(12)};
      color: #8f8f8f;
    }
  }

  .content_detail {
    display: block;
    width: calc(100% - 58px - 15px);
    padding: 0 ${rem(10)};
  }
  .fl {
    float: left;
  }
  .fr {
    float: right;
  }
  .clearfix::after {
    display: block;
    clear: both;
    content: "";
  }
  p {
    display: block;
    padding: ${rem(11)} ${rem(14)};
    font-size: ${rem(12)};
    line-height: ${rem(18)};
    color: #ffffff;
    border-radius: 10px;
    margin-top: 10px;
    box-shadow: 0 6px 12px 0 rgba(0, 0, 0, 0.1);
    background-image: -webkit-linear-gradient(113deg, #76a8ff, #8df6fe);
    background-image: linear-gradient(337deg, #76a8ff, #8df6fe);
  }
`;

class TopContrainer extends PureComponent {
  async componentDidMount() {
    this.loaddata();
  }

  async loaddata() {
    const ct = tweb3.contract(process.env.REACT_APP_CONTRACT);
    const { address } = tweb3.wallet.createAccount();
    console.log(address);
    const result = await ct.methods["propose"]([]).sendCommit({
      signers: address
    });
    console.log(result);
  }

  render() {
    return (
      <TopContainerBox>
        <div className="top__coverimg">
          <img
            src="https://ipfs.io/ipfs/QmUvGeKsdJg1LDfeqyHjrP5JGwaT53gmLfnxK3evxpMBpo"
            alt="itea-scan"
          />
        </div>

        <div className="top__title">
          <img src="/static/img/luggage.svg" alt="itea" />
          <span className="title__content">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. In
            facilisis sollicitudin ultricies.
          </span>
          <span className="title__date">2/4/2004</span>
        </div>

        <WarrperChatBox>
          <FlexWidthBox width="50%">
            <div className="user_photo fl">
              <img src="/static/img/user-men.jpg" alt="itea" />
            </div>
            <div className="content_detail fl clearfix">
              <div className="name_time">
                <span className="user_name color-violet">John Smith</span>
                <span className="time fr color-gray">08/06/2019</span>
              </div>
              <p>
                In ultricies ipsum sem, in ullamcorper velit luctus sed. Fusce
                arcu ante, aliquet sit amet ornare quis, euismod ac justo. Duis
                hendrerit, lacus a facilisis congue,
              </p>
            </div>
          </FlexWidthBox>
          <FlexWidthBox width="50%">
            <div className="user_photo fr">
              <img src="/static/img/user-women.jpg" alt="itea" />
            </div>
            <div className="content_detail fl clearfix">
              <div className="name_time">
                <span className="user_name color-violet">Mary William</span>
                <span className="time fr color-gray">08/06/2019</span>
              </div>
              <p>Duis hendrerit, lacus a facilisis congue</p>
            </div>
          </FlexWidthBox>
        </WarrperChatBox>
      </TopContainerBox>
    );
  }
}

export default TopContrainer;
