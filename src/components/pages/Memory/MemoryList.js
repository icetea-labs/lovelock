import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';

import { useHistory } from 'react-router-dom';

import Chip from '@material-ui/core/Chip';
import CollectionsIcon from '@material-ui/icons/Collections';
import { rem } from '../../elements/StyledUtils';
import MemoryContainer from './MemoryContainer';
import CreateMemory from './CreateMemory';

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
    loading,
    nextPage,
    myPageInfo,
    noCreateMemory,
  } = props;

  const address = useSelector(state => state.account.address);
  const history = useHistory();

  const [edittingMemory, setEdittingMemory] = useState(false)
  const openBlogEditor = () => setEdittingMemory(true)
  const closeBlogEditor = () => setEdittingMemory(false)

  const showCreateMemory = !noCreateMemory && (
   (proIndex && (isOwner || isContributor)) // lock screen
   || (!proIndex && myPageInfo && myPageInfo.address === address) // mypage screen
   || (!proIndex && !myPageInfo)) // home screen
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
      {address && showCreateMemory && (
        <CreateMemory
          proIndex={proIndex}
          collectionId={collectionId}
          collections={collections}
          onMemoryChanged={onMemoryChanged}
          handleNewCollection={handleNewCollection}
          needSelectLock={props.needSelectLock}
          locks={props.locks}
          openBlogEditor={openBlogEditor}
          closeBlogEditor={closeBlogEditor}
          edittingMemory={edittingMemory}
        />
      )}
      <MemoryContainer
        loading={loading}
        pinIndex={pinIndex}
        onMemoryChanged={onMemoryChanged}
        openBlogEditor={setEdittingMemory}
        handleNewCollection={handleNewCollection}
        history={history}
        nextPage={nextPage}
      />
    </RightBox>
  );
}
