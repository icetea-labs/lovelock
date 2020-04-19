import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch, connect } from 'react-redux';

import MemoryList from '../Memory/MemoryList';
import * as actions from '../../../store/actions';
import APIService from '../../../service/apiService';
import appConstants from "../../../helper/constants";
import { useDidUpdate } from '../../../helper/hooks';

function RightContainer(props) {
  const { proIndex, collectionId, memoryList } = props;

  const topInfo = useSelector(state => state.loveinfo.topInfo);
  const collections = topInfo.collections;
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
  }, [])

  useDidUpdate(() => {
    if (noMoreMemories) return;
    if (page * appConstants.memoryPageSize <= memoryList.length) return;
    fetchMemories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  useDidUpdate(() => {
    if (validCollectionId == null && proIndex === topInfo.index) return;
    fetchMemories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proIndex, validCollectionId]);

  useDidUpdate(() => {
    fetchMemories(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [changed]);

  function fetchMemories(loadToCurrentPage = false) {
    (page === 1) && setLoading(true);

    APIService.getMemoriesByLockIndex(proIndex, validCollectionId, page, appConstants.memoryPageSize, loadToCurrentPage).then(result => {
      if (!result.length) {
        setNoMoreMemories(true);
        if (!loadToCurrentPage) {
          setPage(page - 1)
        }
      }

      let memories = result;
      if (page > 1 && !loadToCurrentPage) memories = memoryList.concat(result);
      dispatch(actions.setMemories(memories));
      setLoading(false);
    }).catch(err => {
      console.error(err)
      setLoading(false)
    })
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
