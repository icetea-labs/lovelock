import React, { PureComponent } from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { rem } from '../../../elements/StyledUtils';
import { callView, saveToIpfs, sendTransaction, getTagsInfo, getAlias } from '../../../../helper';
import Icon from '../../../elements/Icon';
import LeftAccept from './LeftAccept';
import LeftPending from './LeftPending';
import * as actions from '../../../../store/actions';
import Promise from '../Promise';
import PromiseAlert from '../PromiseAlert';
import PromiseConfirm from '../PromiseConfirm';

const LeftBox = styled.div`
  width: 100%;
  min-height: ${rem(360)};
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
    margin-bottom: ${rem(20)};
  }
`;
const ShadowBox = styled.div`
  padding: 30px;
  border-radius: 10px;
  /* margin-bottom: 20px; */
  background: #ffffff;
  box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.15);
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
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const { propose, address } = nextProps;

    let value = {};
    if (address !== prevState.address) {
      value = Object.assign({}, { address });
    }
    if (JSON.stringify(propose) !== JSON.stringify(prevState.propose)) {
      value = Object.assign({}, { propose });
    }
    if (value) return value;
    return null;
  }

  componentDidUpdate(prevProps, prevState) {
    const { address } = this.state;

    if (prevState.address !== address) {
      this.loadProposes();
    }
  }

  componentDidMount() {
    this.loadProposes();
  }

  async loadProposes() {
    // const { reload } = this.state;
    const { setPropose, address, setCurrentIndex } = this.props;
    // console.log(' loadProposes address', address);
    let allPropose = await callView('getProposeByAddress', [address]);

    setPropose(allPropose);
    this.setState({ reload: false });

    let tmp = [];
    if (!allPropose) allPropose = [];

    for (let i = 0; i < allPropose.length; i++) {
      const obj = allPropose[i];
      // if (obj.status === 1) {
      const addr = address === obj.sender ? obj.receiver : obj.sender;
      const reps = await getTagsInfo(addr);
      const name = await getAlias(addr);
      console.log('name', name);
      obj.name = reps['display-name'];
      obj.nick = '@' + name;
      obj.index = i;
      tmp.push(obj);
      // }
    }
    // console.log('tmp', tmp);
    if (tmp.length > 0) {
      this.setState({ index: tmp[0].index });
      setCurrentIndex(tmp[0].index);
      // this.loadMemory();
    }
  }

  handlerSelectPropose = index => {
    // console.log('index', index);
    const { setCurrentIndex } = this.props;
    this.setState({ index });
    setCurrentIndex(index);
    // this.loadMemory();
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
  openPending = index => {
    this.setState({ step: 'pending', index: index });
    // console.log('view pending index', index);
  };
  closePopup = () => {
    this.setState({ step: '' });
  };
  nextToAccept = () => {
    this.setState({ step: 'accept' });
  };
  nextToDeny = () => {
    this.setState({ step: 'deny' });
  };

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
    const { step, index } = this.state;
    const { propose, address, tag, privateKey } = this.props;
    return (
      <React.Fragment>
        <LeftBox>
          <ShadowBox>
            <button type="button" className="btn_add_promise" onClick={this.newPromise}>
              <Icon type="add" />
              Add Promise
            </button>
            <div className="title">Accepted promise</div>
            <div>
              <LeftAccept address={address} handlerSelectPropose={this.handlerSelectPropose} />
            </div>
            <div className="title">Pending promise</div>
            <div>
              <LeftPending address={address} openPendingPromise={this.openPending} />
            </div>
            <div className="title">Popular Tag</div>
            <TagBox>{this.renderTag(tag)}</TagBox>
          </ShadowBox>
        </LeftBox>
        {step === 'new' && privateKey && <Promise close={this.closePopup} />}
        {step === 'pending' && (
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
  const { propose, account } = state;
  return {
    propose: propose.propose,
    currentIndex: propose.currentProIndex,
    memory: propose.memory,
    address: account.address,
    privateKey: account.privateKey,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    setPropose: value => {
      dispatch(actions.setPropose(value));
    },
    setCurrentIndex: value => {
      dispatch(actions.setCurrentIndex(value));
    },
    setMemory: value => {
      dispatch(actions.setMemory(value));
    },
    setLoading: value => {
      dispatch(actions.setLoading(value));
    },
    setNeedAuth: value => {
      dispatch(actions.setNeedAuth(value));
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(LeftContrainer);
