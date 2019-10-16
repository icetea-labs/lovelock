import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { FlexBox, FlexWidthBox, rem } from '../../elements/StyledUtils';
import LeftContrainer from '../Propose/Detail/LeftContainer';
import { callView, getTagsInfo } from '../../../helper';
import MemoryContainer from '../Memory/MemoryContainer';

const RightBox = styled.div`
  padding: 0 ${rem(15)} ${rem(45)} ${rem(45)};
`;

function Explore(props) {
  // const [loading, setLoading] = useState(true);
  const [memoByRange, setMemoByRange] = useState([]);
  const { address } = props;

  useEffect(() => {
    loadMemory();
  }, []);

  async function loadMemory() {
    const result = await callView('getMemoriesByRange', [0, 10]);
    // console.log('memoByRange', result);
    setMemoByRange(result);
  }

  return (
    address && (
      <FlexBox wrap="wrap">
        <FlexWidthBox width="30%">
          <LeftContrainer />
        </FlexWidthBox>
        <FlexWidthBox width="70%">
          <RightBox>
            <MemoryContainer memorydata={memoByRange} />
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
