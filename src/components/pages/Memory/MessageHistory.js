import React from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { rem } from '../../elements/Common';
import { TimeWithFormat } from '../../../helper';

const Container = styled.div`
  width: 100%;
`;

const TimelineContainer = styled.div`
  width: 100%;
  margin: 16px 0 32px;
`;

const TitleWrapper = styled.div`
  margin: 16px 0 16px;
  width: 100%;
  height: 52px;
  border-radius: 3px;
  font-family: Montserrat;
  background-image: linear-gradient(331deg, #fccee2, #c4dcfc);
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid #e1e1e1;
  border-bottom: 1px solid #e1e1e1;
  .leftTitle {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .bed {
    width: 32px;
    height: 26px;
    object-fit: contain;
    margin: 0px 14px 0 14px;
  }
  .titleText {
    width: 100%;
    height: 18px;
    font-size: 14px;
    font-weight: 600;
    font-style: normal;
    font-stretch: normal;
    line-height: normal;
    letter-spacing: normal;
    color: #575757;
  }
  .date {
    width: 55px;
    height: 15px;
    font-size: 12px;
    font-weight: 500;
    font-style: normal;
    font-stretch: normal;
    line-height: normal;
    letter-spacing: normal;
    text-align: right;
    color: #575757;
    margin: 0px 18px 0 18px;
  }
`;

const WarrperChatBox = styled.div`
  width: 100%;
  margin: 16px 0 16px;
  min-height: ${rem(90)};
  box-sizing: border-box;
  .fl {
    float: left;
  }
  .fr {
    float: right;
  }
  .message_container {
    display: flex;
    width: 100%;
    .color-violet {
      color: #8250c8;
    }
    .color-gray {
      font-size: 0.75rem;
      color: #8f8f8f;
    }
    .user_avatar {
      img {
        width: 58px;
        height: 58px;
      }
      border-radius: 10px;
      overflow: hidden;
    }
    .sender {
      margin-right: ${rem(26)};
    }
    .receiver {
      margin-left: ${rem(13)};
    }
    .content_detail {
      align-items: center;
      width: 100%;
      height: 100%;
      border-radius: 6px;
      box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.14);
      background-color: #ffffff;
    }
    .clearfix::after {
      display: block;
      clear: both;
      content: '';
    }
    p {
      width: 93%;
      margin: 5px 25px 7px 14px;
      height: 100%;
      font-family: Montserrat;
      font-size: 12px;
      font-weight: 500;
      font-style: normal;
      font-stretch: normal;
      line-height: 1.5;
      letter-spacing: normal;
      color: #8f8f8f;
    }
    .postImg {
      width: 93%;
      margin: 14px 25px 36px 18px;
    }
    .collection {
      display: flex;
      width: 100%;
      margin: 14px 22px 33px 21px;
    }
    .name_time {
      margin-top: 10px;
      .user_name {
        font-weight: 600;
        text-transform: capitalize;
        color: #8250c8;
        width: 100%;
        margin: 0px 0px 0px 15px;
      }
      .time {
        font-size: ${rem(12)};
        color: #8f8f8f;
        margin: 0px 25px 0px 0px;
      }
    }
  }
`;

class MessageHistory extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      memoryList: [],
      currentIndex: -1,
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const { currentIndex, memory } = nextProps;
    let value = {};
    if (currentIndex !== prevState.currentIndex) {
      value = Object.assign({}, { currentIndex });
    }

    if (memory.length !== prevState.memoryList.length) {
      value = Object.assign({}, { memoryList: memory });
    }
    if (value) return value;
    return null;
  }

  componentDidMount() {
    this.loadMemory();
  }

  componentDidUpdate(prevProps, prevState) {
    let { currentIndex, memory } = this.props;
    if (prevState.currentIndex !== currentIndex || prevState.memoryList.length !== memory.length) {
      this.loadMemory();
    }
  }

  async loadMemory() {
    const { currentIndex, memory } = this.props;
    this.setState({ memoryList: memory, currentIndex: currentIndex });
  }

  render() {
    const { memoryList } = this.state;
    // console.log('view state', this.state);
    return memoryList.map(memory => {
      return (
        <Container key={memory.index}>
          <TimelineContainer>
            <TitleWrapper>
              <div className="leftTitle">
                <img src="/static/img/bed.svg" className="bed" alt="titleImg" />
                <div className="titleText">
                  <span>{memory.name} shared a memory</span>
                </div>
              </div>
              <div className="date">
                <TimeWithFormat value={memory.info.date} />
              </div>
            </TitleWrapper>
            <WarrperChatBox>
              <div className="message_container clearfix">
                <div className="user_avatar sender fl ">
                  <img src="/static/img/user-men.jpg" alt="itea" />
                </div>
                <div className="content_detail fr clearfix">
                  <div className="name_time">
                    <span className="user_name color-violet">{memory.name}</span>
                    <span className="time fr color-gray">
                      <TimeWithFormat value={memory.info.date} format="h:mm a DD MMM YYYY" />
                    </span>
                  </div>
                  <p>{memory.content}</p>
                  {memory.info.hash && (
                    <img src={'https://ipfs.io/ipfs/' + memory.info.hash} className="postImg" alt="postImg" />
                  )}
                </div>
              </div>
            </WarrperChatBox>
          </TimelineContainer>
        </Container>
      );
    });
  }
}

MessageHistory.defaultProps = {
  currentIndex: 0,
  memory: [],
};

const mapStateToProps = state => {
  const { propose, account } = state;
  return {
    propose: propose.propose,
    currentIndex: propose.currentProIndex,
    memory: propose.memory,
    address: account.address,
    privateKey: account.privateKey,
  };
};

export default connect(
  mapStateToProps,
  null
)(MessageHistory);
