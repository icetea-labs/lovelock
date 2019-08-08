import styled from "styled-components";
import { FlexBox, FlexWidthBox, rem } from "../elements/Common";
import Icon from "src/components/elements/Icon";
import { WithContext as ReactTags } from "react-tag-input";

const BannerContainer = styled.div`
  margin-bottom: ${rem(20)};
`;
const ShadowBox = styled.div`
  padding: 30px;
  border-radius: 10px;
  /* margin-bottom: 20px; */
  background: #ffffff;
  box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.05);
`;

const WarrperImg = styled.div`
  text-align: center;
  border-radius: 10px;
  /* padding-bottom: 18px; */
  border-bottom: 1px dashed #ebebeb;
  overflow: hidden;
  .txPromise {
    display: flex;
    align-items: center;
    padding: ${rem(20)} 0;
    img {
      padding-right: ${rem(15)};
    }
    .text {
      color: #8250c8;
      font-weight: 600;
      width: 100%;
      text-align: left;
    }
    .date {
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
const LeftBox = styled.div`
  width: 100%;
  min-height: ${rem(360)};
  i {
    padding: 0 5px;
  }
  .btn_add_promise {
    width: 172px;
    height: 46px;
    background: #ffffff;
    border-radius: 23px;
    font-weight: 600;
    color: #8250c8;
    border: 1px solid #8250c8;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 30px;
  }
  .title {
    color: #141927;
    font-weight: 600;
    font-size: ${rem(14)};
    text-transform: uppercase;
    margin-bottom: ${rem(20)};
  }
`;
const RightBox = styled.div`
  width: 100%;
  min-height: ${rem(360)};
  box-sizing: border-box;
  padding-left: ${rem(30)};
  .fl {
    float: left;
  }
  .fr {
    float: right;
  }
  .post_container {
    display: flex;
    width: 100%;
    .user_avatar {
      width: 58px;
      height: 58px;
      border-radius: 10px;
      overflow: hidden;
      margin-right: ${rem(10)};
    }
    .post_input {
      width: 100%;
      height: 50px;
      display: flex;
      align-items: center;
      .contenteditable {
        max-width: 100%;
        width: 100%;
        outline: none;
        font-size: ${rem(16)};
      }
    }
  }

  .custom_post {
    min-height: 55px;
    margin-top: 10px;
    display: flex;
    align-items: center;
    border-top: 1px solid #e1e1e1;
    border-bottom: 1px solid #e1e1e1;
    .tags {
      width: 70%;
      font-size: 12px;
      text-transform: uppercase;
    }
    .options {
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1;
    }
  }
  .action {
    width: 100%;
    margin-top: 16px;
    display: inline-block;
    .privacy {
      display: inline-block;
      float: left;
    }
    button {
      width: 254px;
      line-height: 46px;
      float: right;
      font-size: 16px;
      color: #ffffff;
      font-weight: 600;
      border-radius: 23px;
      box-shadow: 0 5px 14px 0 rgba(0, 0, 0, 0.06);
      background-image: -webkit-linear-gradient(118deg, #b276ff, #fe8dc3);
      background-image: linear-gradient(332deg, #b276ff, #fe8dc3);
    }
  }
`;
const WarrperAcceptedPromise = styled.div`
  display: flex;
  align-items: flex-start;
  margin-bottom: ${rem(20)};
  :hover {
    cursor: pointer;
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
  /* .pri_info {
    width: calc(100% - 141px);
  } */
`;
const TagBox = styled.div`
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  .tagName {
    color: #8250c8;
    margin-right: ${rem(7)};
    font-size: ${rem(12)};
    :hover {
      cursor: pointer;
    }
  }
`;

class Main extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      promises: [
        { name: "Derrick Rogers", nick: "@derickrogers" },
        { name: "Jessie Guzman", nick: "@derickrogers" },
        { name: "Bertie Woods", nick: "@derickrogers" }
      ],
      tag: ["love", "travel", "honeymoon", "relax", "sweet"]
    };
  }

  renderPromise = () => {
    const { promises } = this.state;

    return promises.map((item, index) => {
      return (
        <WarrperAcceptedPromise key={index}>
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
  };
  renderPendingPromise = () => {
    const { promises } = this.state;

    return promises.map((item, index) => {
      return (
        <WarrperAcceptedPromise key={index}>
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
  };

  renderTag = () => {
    const { tag } = this.state;

    return tag.map((item, index) => {
      return (
        <span className="tagName" key={index}>
          #{item}
        </span>
      );
    });
  };

  render() {
    return (
      <main>
        <BannerContainer>
          <ShadowBox>
            <WarrperImg>
              <img src="/static/img/banner.jpg" alt="itea-scan" />
              <div className="txPromise">
                <img src="/static/img/luggage.svg" alt="itea" />
                <span className="text">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. In
                  facilisis sollicitudin ultricies.
                </span>
                <span className="date">2/4/2004</span>
              </div>
            </WarrperImg>
            <WarrperChatBox>
              <FlexWidthBox width="50%">
                <div className="user_photo fl">
                  <img src="/static/img/user-men.jpg" alt="itea" />
                </div>
                <div className="content_detail fl clearfix">
                  <div className="name_time">
                    <span className="user_name color-violet">John Smith</span>
                    <span className="time fr color-grey">08/06/2019</span>
                  </div>
                  <p>
                    In ultricies ipsum sem, in ullamcorper velit luctus sed.
                    Fusce arcu ante, aliquet sit amet ornare quis, euismod ac
                    justo. Duis hendrerit, lacus a facilisis congue,
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
                    <span className="time fr color-grey">08/06/2019</span>
                  </div>
                  <p>Duis hendrerit, lacus a facilisis congue</p>
                </div>
              </FlexWidthBox>
            </WarrperChatBox>
          </ShadowBox>
        </BannerContainer>
        <FlexBox wrap="wrap">
          <FlexWidthBox width="30%">
            <LeftBox>
              <ShadowBox>
                <button type="button" className="btn_add_promise">
                  <Icon type="add" />
                  Add Promise
                </button>
                <div className="title">Accepted promise</div>
                <div>{this.renderPromise()}</div>
                <div className="title">Pending promise</div>
                <div>{this.renderPendingPromise()}</div>
                <div className="title">Popular Tag</div>
                <TagBox>{this.renderTag()}</TagBox>
              </ShadowBox>
            </LeftBox>
          </FlexWidthBox>
          <FlexWidthBox width="70%">
            <RightBox>
              <ShadowBox>
                <div className="memorypost__content">
                  <div className="post_container clearfix">
                    <div className="user_avatar">
                      <img src="/static/img/user-women.jpg" alt="itea" />
                    </div>
                    <div className="post_input fl">
                      <div className="contenteditable" contenteditable="true">
                        Describe your Memory….
                      </div>
                    </div>
                  </div>
                  <div className="custom_post">
                    <div className="tags">
                      <div className="tags_input">
                        <p>Tags: </p>
                        <ReactTags />
                      </div>
                    </div>
                    <div className="options">
                      <div className="place-wrapper">
                        <i class="material-icons">location_on</i>
                      </div>
                      <div className="upload_img" />
                      <i class="material-icons">insert_photo</i>
                      <input type="file" accept=".png, .jpg, .jpeg" />
                    </div>
                    <div className="picktime">
                      <i class="material-icons">today</i>
                      <div className="react-datepicker-wrapper">
                        <div className="react-datepicker__input-container">
                          <input type="text" />
                        </div>
                      </div>
                    </div>
                    <div className="avatar_receiver">
                      <img src="/static/img/user-women.jpg" alt="itea" />
                    </div>
                  </div>
                </div>
                <div className="action">
                  <div className="privacy">
                    <div className="css-1pcexqc-container privacy_select">
                      <div className="css-bg1rzq-control">
                        <div className="css-1hwfws3">
                          <div className="css-dvua67-singleValue">Public</div>
                          <input
                            id="react-select-2-input"
                            className="css-gj7qu5-dummyInput"
                          />
                        </div>
                        <div className="css-1wy0on6">
                          <span className="css-bgvzuu-indicatorSeparator" />
                          <div
                            aria-hidden="true"
                            className="css-16pqwjk-indicatorContainer"
                          >
                            <svg
                              height="20"
                              width="20"
                              viewBox="0 0 20 20"
                              aria-hidden="true"
                              focusable="false"
                              className="css-19bqh2r"
                            >
                              <path d="M4.516 7.548c0.436-0.446 1.043-0.481 1.576 0l3.908 3.747 3.908-3.747c0.533-0.481 1.141-0.446 1.574 0 0.436 0.445 0.408 1.197 0 1.615-0.406 0.418-4.695 4.502-4.695 4.502-0.217 0.223-0.502 0.335-0.787 0.335s-0.57-0.112-0.789-0.335c0 0-4.287-4.084-4.695-4.502s-0.436-1.17 0-1.615z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button type="button" disabled="">
                    Share
                  </button>
                </div>
              </ShadowBox>
            </RightBox>
          </FlexWidthBox>
        </FlexBox>
      </main>
    );
  }
}

export default Main;
