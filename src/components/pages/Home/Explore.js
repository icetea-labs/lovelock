import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { LeftBoxWrapper } from '../../elements/StyledUtils';
import LeftContainer from '../Lock/LeftContainer';
import MemoryList from '../Memory/MemoryList';
import * as actions from '../../../store/actions';

import APIService from '../../../service/apiService';
import appConstants from "../../../helper/constants";

function Explore(props) {
  const { setMemory, memoryList } = props;
  const [loading, setLoading] = useState(true);
  const [changed, setChanged] = useState(false);
  const [page, setPage] = useState(1);
  const [noMoreMemories, setNoMoreMemories] = useState(false);

  const indexParam = Number(props.match.params.index)
  const pinIndex = (indexParam > 0 && Number.isInteger(indexParam)) ? indexParam : null


  useEffect(() => {
    fetchMemories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  useEffect(() => {
    fetchMemories(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [changed]);

  function fetchMemories(loadAll = false) {
    APIService.getChoiceMemories(pinIndex, page, appConstants.memoryPageSize, loadAll).then(result => {
      if (!result.length) {
        setNoMoreMemories(true);
        setLoading(false);
        return;
      }

      let memories = result;
      if (!loadAll) memories = memoryList.concat(result);
      setMemory(memories);
      setLoading(false);
    });
  }

  function refresh() {
    setChanged(c => !c);
  }

  function nextPage() {
    if (noMoreMemories) return;
    setPage(page + 1);
  }

  return (
    <LeftBoxWrapper>
      <div className="proposeColumn proposeColumn--left">
        <LeftContainer loading={loading} />
      </div>
      <div className="proposeColumn proposeColumn--right">
        <MemoryList
          {...props}
          pinIndex={pinIndex}
          onMemoryChanged={refresh}
          loading={loading}
          nextPage={nextPage}
        />
      </div>
    </LeftBoxWrapper>
  );
}

const mapStateToProps = state => {
  return { memoryList: state.loveinfo.memories };
};

const mapDispatchToProps = dispatch => {
  return {
    setMemory: value => {
      dispatch(actions.setMemory(value));
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Explore);
