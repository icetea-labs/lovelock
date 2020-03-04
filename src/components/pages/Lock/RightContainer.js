import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch, connect } from 'react-redux';

import MemoryList from '../Memory/MemoryList';
import * as actions from '../../../store/actions';
import APIService from '../../../service/apiService';
import appConstants from "../../../helper/constants";

function RightContainer(props) {
  const { proIndex, collectionId, memoryList } = props;

  const collections = useSelector(state => state.loveinfo.topInfo.collections);
  const currentCol = collections == null ? '' : collections.find(c => c.id === collectionId);
  const collectionName = currentCol == null ? '' : currentCol.name;
  const validCollectionId = collectionName ? collectionId : null;

  const [changed, setChanged] = useState(false);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [noMoreMemories, setNoMoreMemories] = useState(false);

  const dispatch = useDispatch();

  useEffect(() => {
    fetchMemories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  useEffect(() => {
    fetchMemories(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proIndex, validCollectionId, changed]);

  function fetchMemories(loadToCurrentPage = false) {
    setLoading(true);

    APIService.getMemoriesByLockIndex(proIndex, validCollectionId, page, appConstants.memoryPageSize, loadToCurrentPage).then(result => {
      if (!result.length) {
        setNoMoreMemories(true);
        setLoading(false);
        return;
      }

      let memories = result;
      if (!loadToCurrentPage) memories = memoryList.concat(result);
      dispatch(actions.setMemory(memories));
      setLoading(false);
    });
  }

  function nextPage() {
    if (noMoreMemories) return;
    setPage(page + 1);
  }

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
      nextPage={nextPage}
    />
  );
}

const mapStateToProps = state => {
  return { memoryList: state.loveinfo.memories };
};

export default connect(
  mapStateToProps
)(RightContainer);
