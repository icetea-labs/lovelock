import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';

import { useHistory } from 'react-router-dom';

import Chip from '@material-ui/core/Chip';
import CollectionsIcon from '@material-ui/icons/Collections';
import { rem } from '../../../elements/StyledUtils';
import MemoryContainer from '../../Memory/MemoryContainer';
import CreateMemory from '../../Memory/CreateMemory';
import * as actions from '../../../../store/actions';
import APIService from '../../../../service/apiService';

const RightBox = styled.div`
  padding: 0 0 ${rem(45)} ${rem(45)};
  @media (max-width: 768px) {
    padding-left: 0;
  }
`;

const CollectionIndicator = styled.div`
  margin-bottom: ${rem(16)};
`;

export default function RightContainer(props) {
  const { proIndex, collectionId, handleNewCollection, isOwner, isContributor } = props;
  // const [memoByProIndex, setMemoByProIndex] = useState([]);
  const [changed, setChanged] = useState(false);
  const address = useSelector(state => state.account.address);
  const collections = useSelector(state => state.loveinfo.topInfo.collections);
  const currentCol = !collections || collectionId == null ? '' : collections.find(c => c.id === collectionId);
  const collectionName = currentCol == null ? '' : currentCol.name;
  const validCollectionId = collectionName ? collectionId : null;
  const [loading, setLoading] = useState(false);

  const history = useHistory();
  const dispatch = useDispatch();

  useEffect(() => {
    let cancel = false;

    if (cancel) return;
    setLoading(true);

    APIService.getMemoriesByProIndex(proIndex, validCollectionId).then(mems => {
      // set to redux
      dispatch(actions.setMemory(mems));

      // setTimeout(() => {
      if (cancel) return;
      setLoading(false);
      // }, 50);
    });

    return () => (cancel = true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proIndex, changed, validCollectionId]);

  function refresh() {
    setChanged(c => !c);
  }

  return (
    <RightBox>
      {collectionName && (
        <CollectionIndicator>
          <Chip
            color="primary"
            label={collectionName}
            icon={<CollectionsIcon />}
            onDelete={() => history.push(`/lock/${proIndex}`)}
          />
        </CollectionIndicator>
      )}
      {address && (isOwner || isContributor) && (
        <CreateMemory
          proIndex={proIndex}
          collectionId={validCollectionId}
          collections={collections}
          onMemoryAdded={refresh}
          handleNewCollection={handleNewCollection}
        />
      )}
      <MemoryContainer proIndex={proIndex} collectionId={validCollectionId} memorydata={[]} loading={loading} />
    </RightBox>
  );
}
