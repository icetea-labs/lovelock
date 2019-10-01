import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { FlexBox, FlexWidthBox, rem } from '../../elements/StyledUtils';
import { LinkPro } from '../../elements/Button';
import LeftContrainer from '../Propose/Detail/LeftContrainer';
import { callView, getTagsInfo } from '../../../helper';
import MemoryContainer from '../Memory/MemoryContainer';
import * as actions from '../../../store/actions';
import Promise from '../Propose/Promise';
import LoadPromise from './LoadPromise';

const RightBox = styled.div`
  padding: 0 ${rem(15)} ${rem(45)} ${rem(45)};
`;

function Home(props) {
  const [loading, setLoading] = useState(true);
  const [memoryList, setMemoryList] = useState([]);
  const [openPromise, setOpenPromise] = useState(false);
  const { propose, address, history, setNeedAuth, privateKey } = props;

  useEffect(() => {
    loadMemory();
  }, []);

  async function loadMemory() {
    const allMemory = await callView('getMemoriesByRange', [0, 100]);
    let newMemoryList = [];
    if (allMemory && allMemory.length) {
      for (let i = 0; i < 10; i++) {
        const obj = allMemory[i];
        if (obj) {
          const sender = obj.sender;
          obj.info = JSON.parse(obj.info);
          const reps = await getTagsInfo(sender);
          obj.name = reps['display-name'];
          obj.avatar = reps['avatar'];
          newMemoryList.push(obj);
        }
      }
      newMemoryList = newMemoryList.reverse();
    }
    console.log('newMemoryList', newMemoryList);
    setMemoryList(newMemoryList);
    setLoading(false);
  }

  function openPopup() {
    if (!privateKey) {
      setNeedAuth(true);
    }
    setOpenPromise(true);
  }

  function closePopup() {
    setOpenPromise(false);
    if (propose.length > 0 && propose[propose.length - 1].receiver === process.env.REACT_APP_BOT_LOVER) {
      const index = propose[propose.length - 1].id;
      history.push(`/propose/${index}`);
    }
  }

  return (
    address && (
      <FlexBox wrap="wrap">
        <FlexWidthBox width="30%">
          <LeftContrainer />
        </FlexWidthBox>
        {propose.length > 0 ? (
          <FlexWidthBox width="70%">
            <RightBox>
              {/* <MemoryContainer loading={loading} memoryList={memoryList} /> */}
              <LoadPromise />
            </RightBox>
          </FlexWidthBox>
        ) : (
          <RightBox>
            <div>
              <span>
                You have no relationship yet.
                <LinkPro className="btn_add_promise" onClick={openPopup}>
                  Create one
                </LinkPro>
                or explorer others.
              </span>
            </div>
          </RightBox>
        )}
        {openPromise && privateKey && <Promise close={closePopup} />}
      </FlexBox>
    )
  );
}

const mapStateToProps = state => {
  const { loveinfo, account } = state;
  return {
    propose: loveinfo.propose,
    address: account.address,
    privateKey: account.privateKey,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    setNeedAuth: value => {
      dispatch(actions.setNeedAuth(value));
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Home);
