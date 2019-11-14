import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { FlexBox, FlexWidthBox, rem } from '../../elements/StyledUtils';
import LeftContainer from '../Propose/Detail/LeftContainer';
import { callView } from '../../../helper';
import MemoryContainer from '../Memory/MemoryContainer';
import * as actions from '../../../store/actions';
const RightBox = styled.div`
  padding: 0 ${rem(15)} ${rem(45)} ${rem(45)};
`;

function Explore(props) {
  // const [loading, setLoading] = useState(true);
  const [memoByRange, setMemoByRange] = useState([]);
  const { address, setProposes, setMemory } = props;

  useEffect(() => {
    loadLocksForExplore();
  }, []);

  async function loadLocksForExplore() {
    const lockForFeed = await callView('getLocksForFeed', [address]);
    // console.log('lockForFeed.locks', lockForFeed.locks);
    setProposes(lockForFeed.locks);
    const myLocks = lockForFeed.locks.filter(lock => {
      return lock.isMyLocks;
    });
    let arrayMem = [];
    myLocks.forEach(lock => {
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
      <FlexBox wrap="wrap">
        <FlexWidthBox width="30%">
          <LeftContainer />
        </FlexWidthBox>
        <FlexWidthBox width="70%">
          <RightBox>
            <MemoryContainer memorydata={[]} />
          </RightBox>
        </FlexWidthBox>
      </FlexBox>
    )
  );
}

const mapStateToProps = state => {
  const { account } = state;
  return {
    address: account.address,
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
)(Explore);
