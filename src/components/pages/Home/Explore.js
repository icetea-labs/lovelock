import React, { useEffect } from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { FlexBox, FlexWidthBox, rem } from '../../elements/StyledUtils';
import LeftContainer from '../Propose/Detail/LeftContainer';
import { callView, getJsonFromIpfs } from '../../../helper';
import MemoryContainer from '../Memory/MemoryContainer';
import * as actions from '../../../store/actions';

const RightBox = styled.div`
  padding: 0 ${rem(15)} ${rem(45)} ${rem(45)};
`;

function Explore(props) {
  // const [loading, setLoading] = useState(true);
  // const [memoByRange, setMemoByRange] = useState([]);
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
)(Explore);
