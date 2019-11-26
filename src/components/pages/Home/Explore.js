import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { rem } from '../../elements/StyledUtils';
import LeftContainer from '../Lock/LeftContainer';
import MemoryContainer from '../Memory/MemoryContainer';
import * as actions from '../../../store/actions';

import APIService from '../../../service/apiService';

const RightBoxMemories = styled.div`
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

function Explore(props) {
  const { address, setLocks, setMemory } = props;
  const [loading, setLoading] = useState(true);
  // const [users, isLoading, error, retry] = useAPI('getLocksForFeed', [address]);
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchData() {
    APIService.getLocksForFeed(address).then(resp => {
      // set to redux
      setLocks(resp.locks);

      const memoIndex = resp.locks.reduce((tmp, lock) => {
        return lock.isMyLocks ? tmp.concat(lock.memoIndex) : tmp;
      }, []);
      // console.log('memoIndex', memoIndex);
      memoIndex.length > 0 &&
        APIService.getMemoriesByListMemIndex(memoIndex).then(mems => {
          // set to redux
          setMemory(mems);
        });
      setLoading(false);
    });
  }

  return (
    address && (
      // <FlexBox wrap="wrap">
      //   <FlexWidthBox width="30%">
      //     <LeftContainer loading={loading} />
      //   </FlexWidthBox>
      //   <FlexWidthBox width="70%">
      //     <RightBox>
      //       <MemoryContainer memorydata={[]} />
      //     </RightBox>
      //   </FlexWidthBox>
      // </FlexBox>
      <ProposeWrapper>
        <div className="proposeColumn proposeColumn--left">
          <LeftContainer loading={loading} />
        </div>
        <div className="proposeColumn proposeColumn--right">
          <RightBoxMemories>
            <MemoryContainer memorydata={[]} />
          </RightBoxMemories>
        </div>
      </ProposeWrapper>
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
    setLocks: value => {
      dispatch(actions.setLocks(value));
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
