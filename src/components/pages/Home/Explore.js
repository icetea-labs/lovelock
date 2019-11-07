import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import InfiniteScroll from 'react-infinite-scroller';
import { FlexBox, FlexWidthBox, rem } from '../../elements/StyledUtils';
import LeftContainer from '../Propose/Detail/LeftContainer';
import { callView } from '../../../helper';
import MemoryContainer from '../Memory/MemoryContainer';
// import MemoryContent from '../Memory/MemoryContent';

const RightBox = styled.div`
  padding: 0 ${rem(15)} ${rem(45)} ${rem(45)};
`;

function Explore(props) {
  // const [loading, setLoading] = useState(true);
  const [memoByRange, setMemoByRange] = useState([]);
  const [total, setTotal] = useState(0);
  const { address } = props;

  console.log('memoByRange', memoByRange);
  // console.log('total', total);

  useEffect(() => {
    loadMemory();
  }, []);

  async function loadMemory() {
    const getAllMemories = await callView('getMemories');
    const maxMemo = getAllMemories.length;
    // const start = maxMemo - 5 > 0 ? maxMemo - 5 : 0;
    setTotal(maxMemo);
    // console.log('loadMemory');

    // const getMemoriesByRange = await callView('getMemoriesByRange', [start, maxMemo]);
    // setMemoByRange([getMemoriesByRange]);
  }

  async function loadFunc() {
    if (total > 0) {
      const start = total - 5 > 0 ? total - 5 : 0;
      const getMemoriesByRange = await callView('getMemoriesByRange', [start, total]);
      // console.log('getMemoriesByRange', getMemoriesByRange);
      memoByRange.push(getMemoriesByRange);
      // console.log('push');
      setTimeout(() => {
        // console.log('setTimeout')
        setTotal(start);
        setMemoByRange([...memoByRange]);
      }, 500);
    }
  }

  return (
    address && (
      <FlexBox wrap="wrap">
        <FlexWidthBox width="30%">
          <LeftContainer />
        </FlexWidthBox>
        <FlexWidthBox width="70%">
          <RightBox>
            {/* <MemoryContainer memorydata={memoByRange} /> */}
            <InfiniteScroll
              pageStart={0}
              loadMore={loadFunc}
              hasMore={true || false}
              loader={
                <div className="loader" key={0}>
                  {total === 0 ? '' : 'Loading ...'}
                </div>
              }
            >
              {memoByRange.map((memory, index) => {
                return <MemoryContainer memorydata={memory} key={index} />;
              })}
            </InfiniteScroll>
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

export default connect(
  mapStateToProps,
  null
)(Explore);
