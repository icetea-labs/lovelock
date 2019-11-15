import React, { useEffect } from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { FlexBox, FlexWidthBox, rem } from '../../elements/StyledUtils';
import LeftContainer from '../Propose/Detail/LeftContainer';
import MemoryContainer from '../Memory/MemoryContainer';
import * as actions from '../../../store/actions';

import APIService from '../../../service/apiService';

const RightBox = styled.div`
  padding: 0 ${rem(15)} ${rem(45)} ${rem(45)};
`;

function Explore(props) {
  const { address, setProposes, setMemory } = props;
  // const [users, isLoading, error, retry] = useAPI('getLocksForFeed', [address]);
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchData() {
    APIService.getLocksForFeed(address).then(resp => {
      // set to redux
      setProposes(resp.locks);

      const { memoIndex } = resp.locks.reduce((tmp, lock) => {
        return { memoIndex: lock.isMyLocks ? tmp.memoIndex.concat(lock.memoIndex) : tmp.memoIndex };
      });
      // console.log('memoIndex', memoIndex);
      APIService.getMemoriesByListMemIndex(memoIndex).then(mems => {
        // set to redux
        setMemory(mems);
      });
    });
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
