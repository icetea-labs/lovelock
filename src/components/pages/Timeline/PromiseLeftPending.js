import React, { PureComponent } from 'react';
import styled from 'styled-components';
import { rem } from '../../elements/Common';
import { getTagsInfo, getAlias } from '../../../helper';
import { connect } from 'react-redux';

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
    img {
      width: ${rem(36)};
      height: ${rem(36)};
    }
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
      index: '',
      address: '',
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const { propose, address } = nextProps;
    let value = {};
    if (address !== prevState.address) {
      value = Object.assign({}, { address });
    }
    if (JSON.stringify(propose) !== JSON.stringify(prevState.basePropose)) {
      value = Object.assign({}, { basePropose: propose });
    }
    if (value) return value;
    return null;
  }

  componentDidMount() {
    this.loaddata();
  }

  componentDidUpdate(prevProps, prevState) {
    const { basePropose, address } = this.state;

    if (JSON.stringify(prevState.basePropose) !== JSON.stringify(basePropose) || prevState.address !== address) {
      this.loaddata();
    }
  }

  async loaddata() {
    let { propose } = this.props;
    console.log('check propose', propose);
    let tmp = [];
    if (!propose) propose = [];
    for (let i = 0; i < propose.length; i++) {
      const obj = propose[i];
      if (obj.status === 0) {
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
            <img src="https://trada.tech/assets/img/logo.svg" alt="imgTrada" />
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
)(PromiseLeftPending);
