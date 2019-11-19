import React, { useEffect } from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';

import { rem } from '../../elements/StyledUtils';
import LeftContainer from '../Propose/Detail/LeftContainer';
import MemoryContainer from '../Memory/MemoryContainer';
import * as actions from '../../../store/actions';
import APIService from '../../../service/apiService';

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
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchData() {
    APIService.getLocksForFeed(address).then(resp => {
      // set to redux
      setProposes(resp.locks);
      // console.log(resp.locks);
      const { memoIndex } = resp.locks.reduce((tmp, lock) => {
        return { memoIndex: tmp.memoIndex.concat(lock.memoIndex) };
      }, {});
      // console.log('memoIndex', memoIndex);
      memoIndex &&
        APIService.getMemoriesByListMemIndex(memoIndex).then(mems => {
          // set to redux
          setMemory(mems);
        });
    });
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
