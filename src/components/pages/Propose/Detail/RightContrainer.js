import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { rem } from '../../../elements/StyledUtils';
import { callView, getTagsInfo } from '../../../../helper';
import MessageHistory from '../../Memory/MessageHistory';
import CreateMemory from '../../Memory/CreateMemory';

const RightBox = styled.div`
  padding: 0 ${rem(15)} ${rem(45)} ${rem(45)};
`;

export default function RightContrainer(props) {
  const { proIndex } = props;
  const [loading, setLoading] = useState(true);
  const [memoryList, setMemoryList] = useState([]);

  useEffect(() => {
    async function fetchData() {
      await loadMemory();
    }
    fetchData();
  }, [proIndex]);

  async function loadMemory() {
    const { proIndex } = props;
    const allMemory = await callView('getMemoryByProIndex', [proIndex]);
    let newMemoryList = [];

    for (let i = 0; i < allMemory.length; i++) {
      const obj = allMemory[i];
      const sender = obj.sender;
      obj.info = JSON.parse(obj.info);
      const reps = await getTagsInfo(sender);
      obj.name = reps['display-name'];
      obj.index = [i];
      newMemoryList.push(obj);
    }
    newMemoryList = newMemoryList.reverse();
    // console.log('newMemoryList', newMemoryList);
    setMemoryList(newMemoryList);
    setLoading(false);
  }

  return (
    <RightBox>
      <CreateMemory proIndex={proIndex} loadMemory={loadMemory} />
      <MessageHistory loading={loading} memoryList={memoryList} />
    </RightBox>
  );
}
