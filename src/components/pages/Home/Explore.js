import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { FlexBox, FlexWidthBox, rem } from '../../elements/StyledUtils';
import LeftContrainer from '../Propose/Detail/LeftContrainer';
import { callView, getTagsInfo } from '../../../helper';
import MemoryContainer from '../Memory/MemoryContainer';

const RightBox = styled.div`
  padding: 0 ${rem(15)} ${rem(45)} ${rem(45)};
`;

function Explore(props) {
  const [loading, setLoading] = useState(true);
  const [memoryList, setMemoryList] = useState([]);
  const { address } = props;

  useEffect(() => {
    loadMemory();
  }, []);

  async function loadMemory() {
    const allMemory = await callView('getMemoriesByRange', [0, 100]);

    let newMemoryList = [];
    if (allMemory && allMemory.length) {
      for (let i = 0; i < allMemory.length; i++) {
        const obj = allMemory[i];
        if (obj) {
          const send = obj.sender;
          obj.info = JSON.parse(obj.info);
          const reps = await getTagsInfo(send);
          obj.name = reps['display-name'];
          obj.avatar = reps.avatar;
          newMemoryList.push(obj);
        }
      }
      newMemoryList = newMemoryList.reverse();
      newMemoryList = newMemoryList.slice(0, 10);
      setMemoryList(newMemoryList);
    }
    setLoading(false);
  }

  return (
    address && (
      <FlexBox wrap="wrap">
        <FlexWidthBox width="30%">
          <LeftContrainer />
        </FlexWidthBox>
        <FlexWidthBox width="70%">
          <RightBox>
            <MemoryContainer loading={loading} memoryList={memoryList} />
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
