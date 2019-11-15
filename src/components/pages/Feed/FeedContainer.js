import React, { useEffect } from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';

import { rem } from '../../elements/StyledUtils';
import LeftContainer from '../Propose/Detail/LeftContainer';
import { callView, getJsonFromIpfs } from '../../../helper';
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
function FeedContainer(props) {
  const { setProposes, setMemory } = props;
  const { address } = props;

  useEffect(() => {
    loadLocksForFeed();
  }, []);

  async function loadLocksForFeed() {
    const lockForFeed = await callView('getLocksForFeed', [address]);
    // console.log('lockForFeed.locks', lockForFeed.locks);
    setProposes(lockForFeed.locks);
    let arrayMem = [];
    lockForFeed.locks.forEach(lock => {
      arrayMem = arrayMem.concat(lock.memoIndex);
    });
    // console.log('arrayMem', arrayMem);
    const memorydata = await callView('getMemoriesByListMemIndex', [arrayMem]);
    const newMems = [];
    for (let i = 0; i < memorydata.length; i++) {
      const mem = memorydata[i];
      if (mem.isPrivate) {
        mem.isUnlock = false;
      } else {
        mem.isUnlock = true;
      }
      for (let j = 0; j < mem.info.hash.length; j++) {
        // eslint-disable-next-line no-await-in-loop
        mem.info.hash[j] = await getJsonFromIpfs(mem.info.hash[j], j);
      }
      newMems.push(mem);
    }

    setMemory(newMems);
    // console.log('lockForFeed', lockForFeed);
    // console.log('memorydata', memorydata);
  }

  return (
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
  );
}

const mapStateToProps = state => {
  return {
    address: state.account.address,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    setProposes: value => {
      dispatch(actions.setPropose(value));
    },
    setMemory: value => {
      dispatch(actions.setMemory(value));
    },
  };
};
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(FeedContainer);
