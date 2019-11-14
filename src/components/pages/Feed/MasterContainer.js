import React, { useEffect } from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';

import { rem } from '../../elements/StyledUtils';
import LeftContainer from './LeftContainer';
import { callView } from '../../../helper';
import MemoryContainer from '../Memory/MemoryContainer';
import * as actions from '../../../store/actions';

const RightBox = styled.div`
  padding: 0 0 ${rem(45)} ${rem(45)};
  @media (max-width: 768px) {
    padding-left: 0;
  }
`;
const ProposeWrapper = styled.div`
  display: flex;
  min-height: 100vh;
  .proposeColumn {
    &--left {
      width: 30%;
    }
    &--right {
      width: 70%;
    }
  }
  @media (max-width: 768px) {
    display: block;
    .proposeColumn {
      width: 100%;
      &--left {
        display: none;
      }
    }
  }
`;
function MasterContainer(props) {
  const { setProposes, setMemory } = props;
  const { address } = props;

  useEffect(() => {
    loadLocksForFeed();
  }, []);

  async function loadLocksForFeed() {
    const lockForFeed = await callView('getLocksForFeed', [address]);
    console.log('lockForFeed.locks', lockForFeed.locks);
    setProposes(lockForFeed.locks);
    let arrayMem = [];
    lockForFeed.locks.forEach(lock => {
      arrayMem = arrayMem.concat(lock.memoIndex);
    });
    // console.log('arrayMem', arrayMem);
    const memorydata = await callView('getMemoriesByListMemIndex', [arrayMem]);
    const newMem = memorydata.map(mem => {
      if (mem.isPrivate) {
        mem.isUnlock = false;
      } else {
        mem.isUnlock = true;
      }
      return mem;
    });
    setMemory(newMem);
    // console.log('lockForFeed', lockForFeed);
    console.log('memorydata', memorydata);
  }

  return (
    address && (
      <ProposeWrapper>
        <div className="proposeColumn proposeColumn--left">
          <LeftContainer />
        </div>
        <div className="proposeColumn proposeColumn--right">
          <RightBox>
            <MemoryContainer memorydata={[]} />
          </RightBox>
        </div>
      </ProposeWrapper>
    )
  );
}

const mapStateToProps = state => {
  return {
    proposes: state.loveinfo.proposes,
    address: state.account.address,
    topInfo: state.loveinfo.topInfo,
    tokenAddress: state.account.tokenAddress,
    tokenKey: state.account.tokenKey,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    setProposes: value => {
      dispatch(actions.setPropose(value));
    },
    addPropose: value => {
      dispatch(actions.addPropose(value));
    },
    confirmPropose: value => {
      dispatch(actions.confirmPropose(value));
    },
    setNeedAuth: value => {
      dispatch(actions.setNeedAuth(value));
    },
    setMemory: value => {
      dispatch(actions.setMemory(value));
    },
  };
};
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MasterContainer);
