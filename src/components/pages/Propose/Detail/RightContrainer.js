import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';
import { rem } from '../../../elements/StyledUtils';
import { callView, getTagsInfo, decodeWithPublicKey } from '../../../../helper';
import MessageHistory from '../../Memory/MessageHistory';
import CreateMemory from '../../Memory/CreateMemory';
import * as actions from '../../../../store/actions';

const RightBox = styled.div`
  padding: 0 ${rem(15)} ${rem(45)} ${rem(45)};
`;

export default function RightContrainer(props) {
  const { proIndex } = props;
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [memoryList, setMemoryList] = useState([]);
  const privateKey = useSelector(state => state.account.privateKey);

  useEffect(() => {
    async function fetchData() {
      await loadMemory();
    }
    fetchData();
  }, [proIndex, privateKey]);

  function setNeedAuth(value) {
    dispatch(actions.setNeedAuth(value));
  }

  async function loadMemory() {
    const { proIndex } = props;
    const allMemory = await callView('getMemoryByProIndex', [proIndex]);
    let newMemoryList = [];
    setLoading(true);
    setTimeout(async () => {
      for (let i = 0; i < allMemory.length; i++) {
        const obj = allMemory[i];
        if (obj.isPrivate && !privateKey) {
          setNeedAuth(true);
        }
      }

      for (let i = 0; i < allMemory.length; i++) {
        const obj = allMemory[i];
        const sender = obj.sender;
        obj.info = JSON.parse(obj.info);
        const reps = await getTagsInfo(sender);
        obj.name = reps['display-name'];
        obj.pubkey = reps['pub-key'];
        obj.index = [i];
        if (obj.isPrivate) {
          if (privateKey) {
            // console.log('obj.pubkey', obj.pubkey);
            obj.content = await decodeWithPublicKey(JSON.parse(obj.content), privateKey, obj.pubkey);
          } else {
            obj.content = 'private message...';
          }
        }
        // console.log('obj', obj);
        newMemoryList.push(obj);
      }

      newMemoryList = newMemoryList.reverse();
      // console.log('newMemoryList', newMemoryList);
      setMemoryList(newMemoryList);
      setLoading(false);
    }, 100);
  }

  return (
    <RightBox>
      <CreateMemory proIndex={proIndex} loadMemory={loadMemory} />
      <MessageHistory loading={loading} memoryList={memoryList} />
    </RightBox>
  );
}
