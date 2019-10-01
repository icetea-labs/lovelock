import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { rem } from '../../../elements/StyledUtils';
import { callView, getTagsInfo } from '../../../../helper';
import MemoryContainer from '../../Memory/MemoryContainer';
import CreateMemory from '../../Memory/CreateMemory';
import * as actions from '../../../../store/actions';

const RightBox = styled.div`
  padding: 0 0 ${rem(45)} ${rem(45)};
`;

function RightContrainer(props) {
  const { proIndex, privateKey, setMemory, setNeedAuth } = props;
  const [loading, setLoading] = useState(true);
  // const [memoryList, setMemoryList] = useState([]);

  useEffect(() => {
    loadMemory(proIndex);
  }, [proIndex]);

  async function loadMemory(index) {
    const respMemories = await callView('getMemoriesByProIndex', [index]);

    let newMemoryList = [];
    setLoading(true);
    setTimeout(async () => {
      for (let i = 0; i < respMemories.length; i++) {
        const obj = respMemories[i];
        if (obj.isPrivate && !privateKey) {
          setNeedAuth(true);
          break;
        }
      }

      let tags = [];
      for (let i = 0; i < respMemories.length; i++) {
        const reps = getTagsInfo(respMemories[i].sender);
        tags.push(reps);
      }
      tags = await Promise.all(tags);

      for (let i = 0; i < respMemories.length; i++) {
        const obj = respMemories[i];
        obj.name = tags[i]['display-name'];
        obj.pubkey = tags[i]['pub-key'];
        obj.avatar = tags[i].avatar;
        newMemoryList.push(obj);
      }

      newMemoryList = newMemoryList.reverse();
      // setMemoryList(newMemoryList);
      setMemory(newMemoryList);

      setLoading(false);
    }, 100);
  }

  return (
    <RightBox>
      <CreateMemory proIndex={proIndex} reLoadMemory={loadMemory} />
      <MemoryContainer proIndex={proIndex} loading={loading} />
    </RightBox>
  );
}

const mapStateToProps = state => {
  return {
    privateKey: state.account.privateKey,
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
)(RightContrainer);
