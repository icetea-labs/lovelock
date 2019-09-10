import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { FlexBox, FlexWidthBox } from '../../elements/StyledUtils';
import LeftContrainer from '../Propose/Detail/LeftContrainer';
import { callView, getTagsInfo } from '../../../helper';
import MessageHistory from '../Memory/MessageHistory';

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
    const allMemory = await callView('getMemoryByRange', [0, 10]);
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
    <FlexBox wrap="wrap">
      <FlexWidthBox width="30%">{address && <LeftContrainer />}</FlexWidthBox>
      <FlexWidthBox width="70%">
        <MessageHistory loading={loading} memoryList={memoryList} />
      </FlexWidthBox>
    </FlexBox>
  );
}
