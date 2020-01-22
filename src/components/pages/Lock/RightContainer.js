import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import MemoryList from '../Memory/MemoryList';
import * as actions from '../../../store/actions';
import APIService from '../../../service/apiService';

export default function RightContainer(props) {
  const { proIndex, collectionId } = props;

  const collections = useSelector(state => state.loveinfo.topInfo.collections);
  const currentCol = collections == null ? '' : collections.find(c => c.id === collectionId);
  const collectionName = currentCol == null ? '' : currentCol.name;
  const validCollectionId = collectionName ? collectionId : null;

  const [changed, setChanged] = useState(false);
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();

  useEffect(() => {
    let cancel = false;

    if (cancel) return;
    
    setLoading(true);
  
    APIService.getMemoriesByLockIndex(proIndex, validCollectionId).then(mems => {
      dispatch(actions.setMemory(mems));
      if (cancel) return;
      setLoading(false);
    });

    return () => (cancel = true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proIndex, changed, validCollectionId]);

  function refresh() {
    setChanged(c => !c);
  }

  return (
    <MemoryList 
      {...props}
      onMemoryChanged={refresh}
      loading={loading}
      collections={collections}
      collectionId={validCollectionId}
      collectionName={collectionName}
    />
  );
}
