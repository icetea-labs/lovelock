import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';

import { useHistory } from 'react-router-dom';

import { rem } from '../../../elements/StyledUtils';
import { callView } from '../../../../helper';
import MemoryContainer from '../../Memory/MemoryContainer';
import CreateMemory from '../../Memory/CreateMemory';

import Chip from '@material-ui/core/Chip';
import CollectionsIcon from '@material-ui/icons/Collections';

const RightBox = styled.div`
  padding: 0 0 ${rem(45)} ${rem(45)};
  @media (max-width: 768px) {
    padding-left: 0;
  }
`;

const CollectionIndicator = styled.div`
  margin-bottom: ${rem(16)}
`;

export default function RightContainer(props) {
  const { proIndex, collectionId, handleNewCollection, isOwner } = props;
  const [memoByProIndex, setMemoByProIndex] = useState([]);
  const [changed, setChanged] = useState(false)
  const address = useSelector(state => state.account.address);
  const collections = useSelector(state => state.loveinfo.topInfo.collections)
  const collectionName = collectionId == null ? null : collections.find(c => c.id === collectionId)


  const history = useHistory()

  useEffect(() => {
    let cancel = false

    callView('getMemoriesByProIndex', [proIndex, collectionId]).then(memories => {
      if (cancel) return
      setMemoByProIndex(memories)
    })

    return () => (cancel = true)
  }, [proIndex, changed, collectionId]);

  function refresh() {
    setChanged(c => !c)
  }

  return (
    <RightBox>
      {collectionId != null && (
        <CollectionIndicator>
          <Chip 
            color="primary"
            label={collectionName}
            icon={<CollectionsIcon />}
            onDelete={() => history.push('/lock/' + proIndex)} />
        </CollectionIndicator>
      )}
      {address && isOwner && <CreateMemory 
        proIndex={proIndex} 
        collectionId={collectionId}
        collections={collections}
        onMemoryAdded={refresh}
        handleNewCollection={handleNewCollection} />}
      <MemoryContainer proIndex={proIndex} collectionId={collectionId} memorydata={memoByProIndex} />
    </RightBox>
  );
}
