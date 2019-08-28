import React, { PureComponent } from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { FlexBox, FlexWidthBox, rem } from '../../../elements/Common';
import { getTagsInfo, TimeWithFormat } from '../../../../helper';
import * as actions from '../../../../store/actions';

const TopContainerBox = styled.div`
  .top__coverimg {
    width: ${rem(900)};
    height: ${rem(425)};
    img {
      width: 100%;
      height: 100%;
    }
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
  .proposeMes {
    display : flex;
  }
  .user_photo {
    display: block;
    img {
      width: 58px;
      height: 58px;
    }
    border-radius: 10px;
    object-fit: contain;
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
  constructor(props) {
    super(props);
    this.state = {
      topInfo: {},
      proIndex: -1,
      basePropose: [],
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const { propose, proIndex } = nextProps;
    if (JSON.stringify(propose) !== JSON.stringify(prevState.basePropose) || proIndex !== prevState.proIndex) {
      return { basePropose: propose, proIndex };
    }
    return null;
  }

  componentDidMount() {
    this.loaddata();
  }

  componentDidUpdate(prevProps, prevState) {
    const { basePropose, proIndex } = this.state;

    if (JSON.stringify(prevState.basePropose) !== JSON.stringify(basePropose) || proIndex !== prevState.proIndex) {
      this.loaddata();
    }
  }

  async loaddata() {
    // const { topInfo } = this.state;
    const { propose, proIndex, setLoading } = this.props;
    let newTopInfor = {};
    setLoading(true);
    if (propose.length > 0) {
      const obj = propose[proIndex];
      console.log('proIndex', proIndex);
      console.log('propose', propose);
      newTopInfor.s_content = obj.s_content;
      newTopInfor.r_content = obj.r_content;
      const senderinfor = await getTagsInfo(obj.sender);
      newTopInfor.s_displayname = senderinfor['display-name'];
      const receiverinfor = await getTagsInfo(obj.receiver);
      newTopInfor.r_displayname = receiverinfor['display-name'];
      const info = JSON.parse(obj.info);
      newTopInfor.coverimg = info.hash;
      newTopInfor.s_date = info.date;
      newTopInfor.r_date = info.date;
    }

    // newTopInfor.s_content = 'I love you so much';
    // newTopInfor.s_displayname = 'LuongHV';
    // newTopInfor.r_content = 'Will you marry me?';
    // newTopInfor.r_displayname = 'Hana';
    // newTopInfor.coverimg = 'https://ipfs.io/ipfs/QmUvGeKsdJg1LDfeqyHjrP5JGwaT53gmLfnxK3evxpMBpo';
    // newTopInfor.title = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. In facilisis sollicitudin ultricies.';
    // newTopInfor.date = '2/4/2004';
    // newTopInfor.s_date = '08/06/2019';
    // newTopInfor.r_date = '09/06/2019';

    this.setState({ topInfo: newTopInfor }, setLoading(false));
  }

  render() {
    const { topInfo } = this.state;
    // console.log("topInfo", topInfo);
    return (
      <TopContainerBox>
        <div className="top__coverimg">
          <img src={'https://ipfs.io/ipfs/' + topInfo.coverimg} alt="itea-scan" />
        </div>

        {/* <div className="top__title">
          <img src="/static/img/luggage.svg" alt="itea" />
          <span className="title__content">{topInfo.title}</span>
          <span className="title__date">{topInfo.date}</span>
        </div> */}

        <WarrperChatBox>
          <FlexWidthBox width="50%" className="proposeMes">
            <div className="user_photo fl">
              <img src="/static/img/user-men.jpg" alt="itea" />
            </div>
            <div className="content_detail fl clearfix">
              <div className="name_time">
                <span className="user_name color-violet">{topInfo.s_displayname}</span>
                <span className="time fr color-gray">
                  <TimeWithFormat value={topInfo.s_date} />
                </span>
              </div>
              <p>{topInfo.s_content}</p>
            </div>
          </FlexWidthBox>
          <FlexWidthBox width="50%" className="proposeMes">
            <div className="content_detail fl clearfix">
              <div className="name_time">
                <span className="user_name color-violet">{topInfo.r_displayname}</span>
                <span className="time fr color-gray">
                  <TimeWithFormat value={topInfo.r_date} />
                </span>
              </div>
              <p>{topInfo.r_content}</p>
            </div>
            <div className="user_photo fr">
              <img src="/static/img/user-women.jpg" alt="itea" />
            </div>
          </FlexWidthBox>
        </WarrperChatBox>
      </TopContainerBox>
    );
  }
}

const mapStateToProps = state => {
  const { propose } = state;
  return {
    propose: propose.propose,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    setPropose: value => {
      dispatch(actions.setPropose(value));
    },
    setLoading: value => {
      dispatch(actions.setLoading(value));
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TopContrainer);
