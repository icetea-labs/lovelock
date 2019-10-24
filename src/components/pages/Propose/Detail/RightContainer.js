import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';

import { rem } from '../../../elements/StyledUtils';
import { callView } from '../../../../helper';
import MemoryContainer from '../../Memory/MemoryContainer';
import CreateMemory from '../../Memory/CreateMemory';

const RightBox = styled.div`
  padding: 0 0 ${rem(45)} ${rem(45)};
`;

export default function RightContrainer(props) {
  const { proIndex, isOwner } = props;
  const [memoByProIndex, setMemoByProIndex] = useState([]);
  const address = useSelector(state => state.account.address);

  useEffect(() => {
    loadMemory(proIndex);
  }, [proIndex]);

  function loadMemory(index) {
    callView('getMemoriesByProIndex', [index]).then(memories => {
      setMemoByProIndex(memories);
    });
  }
  // console.log('isOwner', isOwner);
  return (
    <RightBox>
      {address && isOwner && <CreateMemory proIndex={proIndex} reLoadMemory={loadMemory} />}
      <MemoryContainer proIndex={proIndex} memorydata={memoByProIndex} />
    </RightBox>
  );
}
