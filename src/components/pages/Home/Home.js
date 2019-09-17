import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { FlexBox, FlexWidthBox } from '../../elements/StyledUtils';
import LeftContrainer from '../Propose/Detail/LeftContrainer';
import { callView, getTagsInfo } from '../../../helper';
import MemoryContainer from '../Memory/MemoryContainer';
import { rem } from '../../elements/StyledUtils';

const RightBox = styled.div`
  padding: 0 ${rem(15)} ${rem(45)} ${rem(45)};
`;

export default function Home() {
  const address = useSelector(state => state.account.address);
  const [loading, setLoading] = useState(true);
  const [memoryList, setMemoryList] = useState([]);
  useEffect(() => {
    async function fetchData() {
      await loadMemory();
    }
    fetchData();
  }, []);
  async function loadMemory() {
    const allMemory = await callView('getMemoriesByRange', [0, 10]);
    let newMemoryList = [];

    for (let i = 0; i < allMemory.length; i++) {
      const obj = allMemory[i];
      const sender = obj.sender;
      obj.info = JSON.parse(obj.info);
      const reps = await getTagsInfo(sender);
      obj.name = reps['display-name'];
      newMemoryList.push(obj);
    }
    newMemoryList = newMemoryList.reverse();
    // console.log('newMemoryList', newMemoryList);
    setMemoryList(newMemoryList);
    setLoading(false);
  }
  return (
    <FlexBox wrap="wrap">
      <FlexWidthBox width="30%">{address && <LeftContrainer />}</FlexWidthBox>
      <FlexWidthBox width="70%">
        <RightBox>
          <MemoryContainer loading={loading} memoryList={memoryList} />
        </RightBox>
      </FlexWidthBox>
    </FlexBox>
  );
}
