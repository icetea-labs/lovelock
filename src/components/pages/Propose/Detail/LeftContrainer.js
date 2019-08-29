import React, { PureComponent } from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { rem } from '../../../elements/StyledUtils';
import Icon from '../../../elements/Icon';
import LeftAccept from './LeftAccept';
import LeftPending from './LeftPending';
import * as actions from '../../../../store/actions';

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
      proIndex: -1,
      pendingIndex: -1,
      isPromise: false,
      isPendingPromise: false,
    };
  }
  addPromise = () => {
    this.setState({ isPromise: true });
  };

  handlerSelectPropose = proIndex => {
    // console.log('proIndex', proIndex);
    const { setCurrentIndex } = this.props;
    this.setState({ proIndex });
    setCurrentIndex(proIndex);
    this.loadMemory();
  };

  openPending = index => {
    this.setState({ isPendingPromise: true, pendingIndex: index });
    console.log('view pending index', index);
  };

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

  render() {
    const { address, tag } = this.props;
    return (
      <LeftBox>
        <ShadowBox>
          <button type="button" className="btn_add_promise" onClick={this.addPromise}>
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
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(LeftContrainer);
