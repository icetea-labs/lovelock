import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
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
  const { proIndex } = props;
  const [memoByProIndex, setMemoByProIndex] = useState([]);
  // const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    loadMemory(proIndex);
  }, [proIndex]);

  async function loadMemory(index) {
    const respMemories = await callView('getMemoriesByProIndex', [index]);
    setMemoByProIndex(respMemories);
    // let newMemoryList = [];
    // setLoading(true);
    // setTimeout(async () => {
    //   try {
    //     for (let i = 0; i < respMemories.length; i++) {
    //       const obj = respMemories[i];
    //       if (obj.isPrivate && !privateKey) {
    //         setNeedAuth(true);
    //         break;
    //       }
    //     }

    //     let tags = [];
    //     for (let i = 0; i < respMemories.length; i++) {
    //       const reps = getTagsInfo(respMemories[i].sender);
    //       tags.push(reps);
    //     }
    //     tags = await Promise.all(tags);

    //     for (let i = 0; i < respMemories.length; i++) {
    //       const obj = respMemories[i];
    //       obj.name = tags[i]['display-name'];
    //       obj.pubkey = tags[i]['pub-key'];
    //       obj.avatar = tags[i].avatar;
    //       if (obj.receiver) {
    //         // eslint-disable-next-line no-await-in-loop
    //         const receiverTags = await getTagsInfo(obj.receiver);
    //         obj.r_name = receiverTags['display-name'];
    //       }
    //       for (let j = 0; j < obj.info.hash.length; j++) {
    //         // eslint-disable-next-line no-await-in-loop
    //         obj.info.hash[j] = await getJsonFromIpfs(obj.info.hash[j], j);
    //       }
    //       newMemoryList.push(obj);
    //     }

    //     newMemoryList = newMemoryList.reverse();
    //     setMemory(newMemoryList);
    //     setLoading(false);
    //   } catch (e) {
    //     const message = 'Load memory error!';
    //     enqueueSnackbar(message, { variant: 'error' });
    //   }
    // }, 100);
  }

  return (
    <RightBox>
      <CreateMemory proIndex={proIndex} reLoadMemory={loadMemory} />
      <MemoryContainer proIndex={proIndex} memorydata={memoByProIndex} />
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
