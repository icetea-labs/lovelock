import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';

import { useHistory } from 'react-router-dom';

import Chip from '@material-ui/core/Chip';
import CollectionsIcon from '@material-ui/icons/Collections';
import { rem } from '../../elements/StyledUtils';
import MemoryContainer from './MemoryContainer';
import CreateMemory from './CreateMemory';
import BlogEditor from "./BlogEditor";

const RightBox = styled.div`
  padding: 0 0 ${rem(45)} ${rem(45)};
  @media (max-width: 768px) {
    padding-left: 0;
  }
`;

const CollectionIndicator = styled.div`
  margin-bottom: ${rem(16)};
`;

export default function MemoryList(props) {
  const {
    proIndex,
    pinIndex,
    collectionId,
    collectionName,
    collections,
    handleNewCollection,
    isOwner,
    isContributor,
    onMemoryChanged,
    myPageRoute,
    loading,
    nextPage
  } = props;

  const [edittingMemory, setEdittingMemory] = useState(false)

  const address = useSelector(state => state.account.address);
  const history = useHistory();

  const openBlogEditor = () => setEdittingMemory(true)
  const closeBlogEditor = () => setEdittingMemory(false)

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
      {proIndex != null && address && (isOwner || isContributor) && (
        <CreateMemory
          proIndex={proIndex}
          collectionId={collectionId}
          collections={collections}
          onMemoryChanged={onMemoryChanged}
          handleNewCollection={handleNewCollection}
        />
      )}
      <MemoryContainer
        loading={loading}
        pinIndex={pinIndex}
        onMemoryChanged={onMemoryChanged}
        handleNewCollection={handleNewCollection}
        myPageRoute={myPageRoute}
        history={history}
        nextPage={nextPage}
      />
    </RightBox>
  );
}
