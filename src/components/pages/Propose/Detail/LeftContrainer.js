import React, { PureComponent } from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { withSnackbar } from 'notistack';
import tweb3 from '../../../../service/tweb3';
import { rem } from '../../../elements/StyledUtils';
import { callView, getTagsInfo, getAlias } from '../../../../helper';
import Icon from '../../../elements/Icon';
import { LinkPro } from '../../../elements/Button';
import LeftProposes from './LeftProposes';
import * as actions from '../../../../store/actions';
import Promise from '../Promise';
import PromiseAlert from '../PromiseAlert';
import PromiseConfirm from '../PromiseConfirm';

const LeftBox = styled.div`
  width: 100%;
  min-height: ${rem(360)};
  margin-bottom: ${rem(100)};
  i {
    padding: 0 5px;
  }
  .btn_add_promise {
    width: 172px;
    height: 46px;
    border-radius: 23px;
    font-weight: 600;
    font-size: ${rem(14)};
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
    /* margin-bottom: ${rem(20)}; */
  }
`;
const ShadowBox = styled.div`
  padding: 30px;
  border-radius: 10px;
  background: #fff;
  box-shadow: '0 1px 4px 0 rgba(0, 0, 0, 0.15)';
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
class LeftContrainer extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      index: -1,
      step: '',
      propose: [],
      loading: true,
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const { propose } = nextProps;

    let value = {};
    if (JSON.stringify(propose) !== JSON.stringify(prevState.propose)) {
      value = Object.assign({}, { propose });
    }
    if (value) return value;
    return null;
  }

  componentDidMount() {
    this.loadProposes();
    this.watchPropose();
  }

  componentDidUpdate(prevProps, prevState) {
    const { propose } = this.state;

    if (JSON.stringify(propose) !== JSON.stringify(prevState.propose)) {
      this.loadProposes();
    }
  }

  watchPropose = async () => {
    const { address } = this.props;
    const filter = {}; //{ by: address };
    tweb3.subscribe('Tx', filter, async (error, result) => {
      if (error) {
        console.error(error);
      } else {
        const data = result.data.value.TxResult.events[0];
        const eventData = data && data.eventData;
        if (eventData && eventData.log && (address === eventData.log.receiver || address === eventData.log.sender)) {
          // console.log('eventData', eventData);
          switch (data.eventName) {
            case 'createPropose':
              await this.eventCreatePropose(eventData);
              break;
            case 'confirmPropose':
              this.eventConfirmPropose(eventData);
              break;
            default:
              break;
          }
        }
        // console.log('not me');
      }
    });
  };

  closePopup = () => {
    const { propose, history } = this.props;
    this.setState({ step: '' });
    if (propose[propose.length - 1].receiver === process.env.REACT_APP_BOT_LOVER) {
      const index = propose[propose.length - 1].id;
      history.push(`/propose/${index}`);
    }
  };

  nextToAccept = () => {
    this.setState({ step: 'accept' });
  };

  nextToDeny = () => {
    this.setState({ step: 'deny' });
  };

  selectAccepted = index => {
    const { history } = this.props;
    history.push(`/propose/${index}`);
  };

  newPromise = () => {
    const { setNeedAuth, privateKey } = this.props;
    if (!privateKey) {
      setNeedAuth(true);
      this.setState({ step: 'new' });
    } else {
      this.setState({ step: 'new' });
    }
  };

  selectPending = index => {
    const { setNeedAuth, privateKey } = this.props;
    if (!privateKey) {
      setNeedAuth(true);
      this.setState({ step: 'pending', index });
    } else {
      this.setState({ step: 'pending', index });
    }
    // console.log('view pending index', index);
  };

  eventConfirmPropose(data) {
    const { setPropose, propose, address, enqueueSnackbar } = this.props;
    const newArray = propose.slice() || [];
    const objIndex = newArray.findIndex(obj => obj.id === data.log.id);
    newArray[objIndex] = Object.assign({}, newArray[objIndex], data.log);
    // console.log('newArray', newArray[objIndex]);
    // console.log('eventConfirmPropose');
    if (address === data.log.sender) {
      const message = 'Your propose has been approved.';
      enqueueSnackbar(message, { variant: 'info' });
    }
    setPropose(newArray);
  }

  async eventCreatePropose(data) {
    const { setPropose, propose, address, enqueueSnackbar } = this.props;
    // console.log('data.log', data.log);
    const log = await this.addInfoToProposes(data.log);
    // console.log('eventCreatePropose');
    setPropose([...propose, log]);
    // console.log('propose.sender', log);
    if (address !== log.sender) {
      const message = 'You have a new propose.';
      enqueueSnackbar(message, { variant: 'info' });
    }
  }

  async loadProposes() {
    this.setState({ loading: true });
    const { address, setPropose } = this.props;
    const proposes = (await callView('getProposeByAddress', [address])) || [];
    const newPropose = await this.addInfoToProposes(proposes);
    setPropose(newPropose);
    this.setState({ loading: false });
  }

  async addInfoToProposes(proposes) {
    const { address } = this.props;

    for (let i = 0; i < proposes.length; i++) {
      // Get address partner
      let partnerAddress = '';
      if (proposes[i].receiver === process.env.REACT_APP_BOT_LOVER) {
        partnerAddress = proposes[i].sender;
      } else {
        partnerAddress = proposes[i].sender === address ? proposes[i].receiver : proposes[i].sender;
      }
      // Get info tags partner. case on receiver is bot address -> get tags info of sender address
      const reps = await getTagsInfo(partnerAddress);
      const botInfo = JSON.parse(proposes[i].bot_info || '{}');
      if (proposes[i].receiver === process.env.REACT_APP_BOT_LOVER) {
        proposes[i].name = `${botInfo.firstname} ${botInfo.lastname}`;
        proposes[i].avatar = botInfo.botAva;
      } else {
        proposes[i].name = reps['display-name'];
        proposes[i].avatar = reps['avatar'];
      }

      const nick = await getAlias(partnerAddress);
      proposes[i].nick = '@' + nick;
    }
    return proposes;
  }

  renderTag = tag => {
    // const { tag } = this.state;
    // return tag.map((item, index) => {
    //   return (
    //     <span className="tagName" key={index}>
    //       #{item}
    //     </span>
    //   );
    // });
  };

  render() {
    const { step, loading, index } = this.state;
    const { propose, address, tag, privateKey } = this.props;
    return (
      <React.Fragment>
        <LeftBox>
          <ShadowBox>
            <LinkPro className="btn_add_promise" onClick={this.newPromise}>
              <Icon type="add" />
              Add Promise
            </LinkPro>
            <div className="title">Accepted promise</div>
            <div>
              <LeftProposes loading={loading} flag={1} handlerSelect={this.selectAccepted} />
            </div>
            <div className="title">Pending promise</div>
            <div>
              <LeftProposes loading={loading} flag={0} handlerSelect={this.selectPending} />
            </div>
            <div className="title">Popular Tag</div>
            <TagBox>{this.renderTag(tag)}</TagBox>
          </ShadowBox>
        </LeftBox>
        {step === 'new' && privateKey && <Promise close={this.closePopup} />}
        {step === 'pending' && privateKey && (
          <PromiseAlert
            index={index}
            propose={propose}
            address={address}
            close={this.closePopup}
            accept={this.nextToAccept}
            deny={this.nextToDeny}
          />
        )}
        {step === 'accept' && <PromiseConfirm close={this.closePopup} index={index} />}
        {step === 'deny' && <PromiseConfirm isDeny close={this.closePopup} index={index} />}
      </React.Fragment>
    );
  }
}

const mapStateToProps = state => {
  const { loveinfo, account } = state;
  return {
    propose: loveinfo.propose,
    address: account.address,
    privateKey: account.privateKey,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    setPropose: value => {
      dispatch(actions.setPropose(value));
    },
    setNeedAuth: value => {
      dispatch(actions.setNeedAuth(value));
    },
  };
};

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(withSnackbar(LeftContrainer))
);
