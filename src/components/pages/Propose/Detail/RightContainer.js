import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import styled from 'styled-components';
// import { useSnackbar } from 'notistack';

import { rem } from '../../../elements/StyledUtils';
import { callView } from '../../../../helper';
import MemoryContainer from '../../Memory/MemoryContainer';
import CreateMemory from '../../Memory/CreateMemory';
import * as actions from '../../../../store/actions';

const RightBox = styled.div`
  padding: 0 0 ${rem(45)} ${rem(45)};
`;

function RightContrainer(props) {
  const { proIndex, topInfo, address } = props;
  const [memoByProIndex, setMemoByProIndex] = useState([]);
  // const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    loadMemory(proIndex);
  }, [proIndex]);

  function loadMemory(index) {
    callView('getMemoriesByProIndex', [index]).then(memories => {
      setMemoByProIndex(memories);
    });
  }

  const isOwner = address === topInfo.sender || address === topInfo.receiver;

  return (
    <RightBox>
      {address && isOwner && <CreateMemory proIndex={proIndex} reLoadMemory={loadMemory} topInfo={topInfo} />}
      <MemoryContainer proIndex={proIndex} memorydata={memoByProIndex} topInfo={topInfo} />
    </RightBox>
  );
}

const mapStateToProps = state => {
  return {
    privateKey: state.account.privateKey,
    address: state.account.address,
    topInfo: state.loveinfo.topInfo,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    setMemory: value => {
      dispatch(actions.setMemory(value));
    },
    setNeedAuth(value) {
      dispatch(actions.setNeedAuth(value));
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(RightContrainer));
