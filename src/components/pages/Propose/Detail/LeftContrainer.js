import React, { PureComponent } from 'react';
import styled from 'styled-components';
import tweb3 from '../../../../service/tweb3';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
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
  background: #fff;
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
      propose: [],
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

  componentDidUpdate(prevProps, prevState) {
    const { propose } = this.state;

    if (JSON.stringify(propose) !== JSON.stringify(prevState.propose)) {
      this.loadProposes();
    }
  }

  componentDidMount() {
    this.loadProposes();
    this.watchPropose();
  }
  watchPropose = async () => {
    const { address } = this.props;
    const contract = tweb3.contract(process.env.REACT_APP_CONTRACT);
    const filter = { by: address };
    contract.events.createPropose(filter, async (error, data) => {
      if (error) {
        console.error(error);
      } else {
        const { setPropose, propose } = this.props;
        // console.log(propose);
        const log = await this.addInfoToProposes(data.log);
        console.log(log);
        // propose.push(log);
        setPropose([...propose, log]);
      }
    });
  };
  async loadProposes() {
    const { address, setPropose } = this.props;
    const proposes = (await callView('getProposeByAddress', [address])) || [];
    const newPropose = await this.addInfoToProposes(proposes);
    setPropose(newPropose);
  }

  async addInfoToProposes(proposes) {
    const { address } = this.props;
    for (let i = 0; i < proposes.length; i++) {
      const newAddress = address === proposes[i].sender ? proposes[i].receiver : proposes[i].sender;
      const reps = await getTagsInfo(newAddress);
      const name = await getAlias(newAddress);
      proposes[i].name = reps['display-name'];
      proposes[i].nick = '@' + name;
    }
    return proposes;
  }

  selectAccepted = index => {
    // console.log('index', index);
    // const { setCurrentIndex } = this.props;
    // this.setState({ index });
    // setCurrentIndex(index);
    // this.loadMemory();
    this.props.history.push('/propose/' + index);
  };

  newPromise = () => {
    this.setState({ step: 'new' });
  };
  selectPending = index => {
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
    const { propose, address, tag } = this.props;
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
              <LeftProposes flag={1} handlerSelect={this.selectAccepted} />
            </div>
            <div className="title">Pending promise</div>
            <div>
              <LeftProposes flag={0} handlerSelect={this.selectPending} />
            </div>
            <div className="title">Popular Tag</div>
            <TagBox>{this.renderTag(tag)}</TagBox>
          </ShadowBox>
        </LeftBox>
        {step === 'new' && <Promise close={this.closePopup} />}
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
      dispatch(actions.setLoading(value));
    },
  };
};

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(LeftContrainer)
);
