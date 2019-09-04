import React, { PureComponent } from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { callView, saveToIpfs, sendTransaction, getTagsInfo, getAlias } from '../../../../helper';
import * as actions from '../../../../store/actions';
import { FlexBox, FlexWidthBox, rem } from '../../../elements/StyledUtils';
import TopContrainer from './TopContrainer';
import LeftContrainer from './LeftContrainer';
import RightContrainer from './RightContrainer';

const BannerContainer = styled.div`
  margin-bottom: ${rem(20)};
`;
const ShadowBox = styled.div`
  padding: 30px;
  border-radius: 10px;
  /* margin-bottom: 20px; */
  background: #ffffff;
  box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.15);
`;

class DetailPropose extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      tag: ['love', 'travel', 'honeymoon', 'relax', 'sweet'],
      ownerTag: ['honeymoon', 'travel'],
      reload: true,
      proIndex: -1,
      pendingIndex: -1,
      date: new Date(),
      file: '',
      memoryContent: '',
      address: '',
      propose: [],
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    // const { propose, address } = nextProps;
    const proIndex = parseInt(nextProps.match.params.index);

    let value = {};
    // if (address !== prevState.address) {
    //   value = Object.assign({}, { address });
    // }
    // if (JSON.stringify(propose) !== JSON.stringify(prevState.propose)) {
    //   value = Object.assign({}, { propose });
    // }
    if (proIndex !== prevState.proIndex) {
      value = Object.assign({}, { proIndex });
    }
    if (value) return value;
    return null;
  }

  componentDidUpdate(prevProps, prevState) {
    const { address } = this.state;

    if (prevState.address !== address) {
      // this.loadAllPropose();
    }
  }

  componentDidMount() {
    // this.loadAllPropose();
  }

  async loadAllPropose() {
    // const { reload } = this.state;
    const { setPropose, address, setCurrentIndex } = this.props;
    // console.log(' loadAllPropose address', address);
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
      obj.name = reps['display-name'];
      obj.nick = '@' + name;
      obj.index = i;
      tmp.push(obj);
      // }
    }
    // console.log('tmp', tmp);
    if (tmp.length > 0) {
      this.setState({ proIndex: tmp[0].index });
      setCurrentIndex(tmp[0].index);
      this.loadMemory();
    }
  }

  renderTag = tag => {
    // const { tag } = this.state;
    return tag.map((item, index) => {
      return (
        <span className="tagName" key={index}>
          #{item}
        </span>
      );
    });
  };

  handlerSelectPropose = proIndex => {
    // console.log('proIndex', proIndex);
    const { setCurrentIndex } = this.props;
    this.setState({ proIndex });
    setCurrentIndex(proIndex);
    this.loadMemory();
  };

  async loadMemory() {
    const { setMemory } = this.props;
    const { proIndex } = this.state;
    const allMemory = await callView('getMemoryByProIndex', [proIndex]);
    let newMemoryList = [];

    for (let i = 0; i < allMemory.length; i++) {
      const obj = allMemory[i];
      const sender = obj.sender;
      obj.info = JSON.parse(obj.info);
      const reps = await getTagsInfo(sender);
      obj.name = reps['display-name'];
      obj.index = [i];
      newMemoryList.push(obj);
    }
    newMemoryList = newMemoryList.reverse();
    setMemory(newMemoryList);
  }

  onChangeCus = (date, file) => {
    console.log('view Date', date);
    console.log('view File', file);
    this.setState({ date, file });
  };

  statusChange = e => {
    const value = e.target.value;
    this.setState({
      memoryContent: value,
    });
  };

  async shareMemory(proIndex, memoryContent, date, file) {
    const { setLoading } = this.props;
    setLoading(true);
    let hash;
    if (file) {
      hash = await saveToIpfs(file);
    }
    const name = 'addMemory';
    let info = {
      date: date,
      hash: hash,
    };
    info = JSON.stringify(info);
    const params = [proIndex, memoryContent, info];
    const result = await sendTransaction(name, params);
    console.log('View result', result);
    if (result) {
      this.loadMemory();
      window.alert('Success');
    }
    setLoading(false);
  }

  render() {
    const { proIndex } = this.state;
    return (
      <React.Fragment>
        <BannerContainer>
          <ShadowBox>
            <TopContrainer proIndex={proIndex} />
          </ShadowBox>
        </BannerContainer>

        <FlexBox wrap="wrap" minHeight="100vh">
          <FlexWidthBox width="30%">
            <LeftContrainer />
          </FlexWidthBox>
          <FlexWidthBox width="70%">
            <RightContrainer proIndex={proIndex} />
          </FlexWidthBox>
        </FlexBox>
      </React.Fragment>
    );
  }
}

const mapStateToProps = state => {
  const { loveinfo, account } = state;
  return {
    propose: loveinfo.propose,
    currentIndex: loveinfo.currentProIndex,
    memory: loveinfo.memory,
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
      // dispatch(actions.setLoading(value));
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DetailPropose);
