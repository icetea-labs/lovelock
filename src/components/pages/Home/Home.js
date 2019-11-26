import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { connect, useDispatch } from 'react-redux';
import { FlexBox, FlexWidthBox, rem } from '../../elements/StyledUtils';
import { LinkPro, ButtonPro } from '../../elements/Button';
import LeftContainer from '../Lock/LeftContainer';
import MemoryContainer from '../Memory/MemoryContainer';
import LandingPage from '../../layout/LandingPage';
// import PuNewLock from '../Propose/PuNewLock';
import * as actions from '../../../store/actions';
import APIService from '../../../service/apiService';

const RightBoxMemories = styled.div`
  padding: 0 0 ${rem(45)} ${rem(45)};
  @media (max-width: 768px) {
    padding-left: 0;
  }
`;
const ProposeWrapper = styled.div`
  display: flex;
  min-height: 100vh;
  .proposeColumn {
    &--left {
      width: 30%;
    }
    &--right {
      width: 70%;
    }
  }
  @media (max-width: 768px) {
    display: block;
    .proposeColumn {
      width: 100%;
      &--left {
        display: none;
      }
    }
  }
`;
const RightBox = styled.div`
  text-align: center;
  padding: ${rem(30)};
  img {
    width: 200px;
    height: 200px;
  }
  h1,
  h2 {
    text-align: center;
  }
  .emptyTitle {
    margin: 16px auto;
    font-size: 25px;
    line-height: 32px;
    font-weight: 60px;
  }
  .emptySubTitle {
    color: #506175;
    font-size: 18px;
    line-height: 24px;
    margin: 16px auto;
  }
`;

const ActionForm = styled.div`
  margin-top: 20px;
`;

const ShadowBox = styled.div`
  padding: ${rem(30)};
  border-radius: 10px;
  background: #f5f5f8;
  box-shadow: '0 1px 4px 0 rgba(0, 0, 0, 0.15)';
`;
function Home(props) {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const { setProposes, setMemory, address, locks, history } = props;
  // const [locks, setlocks] = useState(null);

  useEffect(() => {
    let cancel = false;
    fetchData(cancel);
    return () => {
      cancel = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchData(cancel) {
    console.log('fetchData');
    APIService.getLocksForFeed(address).then(resp => {
      // set to redux
      setProposes(resp.locks);
      if (cancel) return;
      const memoIndex = resp.locks.reduce((tmp, lock) => {
        return tmp.concat(lock.memoIndex);
      }, []);
      // console.log('memoIndex', memoIndex);
      memoIndex.length > 0 &&
        APIService.getMemoriesByListMemIndex(memoIndex).then(mems => {
          // set to redux
          setMemory(mems);
        });
      setLoading(false);
    });
  }
  function openPopup() {
    dispatch(actions.setNewLock(true));
  }

  function openExplore() {
    history.push('/explore');
  }

  // function closePopup() {
  //   fetchData();
  // }

  const renderHomeEmptyPropose = (
    <FlexWidthBox>
      <ShadowBox>
        <RightBox>
          <div>
            <img src="/static/img/plant.svg" alt="plant" />
            <div className="emptyTitle">
              <h1>You have no locks yet.</h1>
            </div>
            <div className="emptySubTitle">
              <h2>Locks are the way you connect and share memories with your loved ones.</h2>
            </div>
            <ActionForm>
              <ButtonPro variant="contained" color="primary" onClick={openPopup}>
                Create first lock
              </ButtonPro>
            </ActionForm>
            <LinkPro className="btn_add_promise" onClick={openExplore}>
              or explore others&apos;
            </LinkPro>
          </div>
        </RightBox>
      </ShadowBox>
    </FlexWidthBox>
  );
  const isRegistered = !!address;
  const isHaveLocks = locks.length > 0;
  // console.log('render home', isHaveLocks, '---', loading, '---->', locks);
  return isRegistered ? (
    <>
      {!loading && (
        <>
          {isHaveLocks ? (
            <ProposeWrapper>
              <div className="proposeColumn proposeColumn--left">
                <LeftContainer loading={loading} />
              </div>
              <div className="proposeColumn proposeColumn--right">
                <RightBoxMemories>
                  <MemoryContainer memorydata={[]} />
                </RightBoxMemories>
              </div>
            </ProposeWrapper>
          ) : (
            <FlexBox wrap="wrap" justify="center">
              {renderHomeEmptyPropose}
            </FlexBox>
          )}
        </>
      )}
    </>
  ) : (
    <LandingPage />
  );
}

const mapStateToProps = state => {
  return {
    address: state.account.address,
    locks: state.loveinfo.proposes,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    setProposes: value => {
      dispatch(actions.setPropose(value));
    },
    setMemory: value => {
      dispatch(actions.setMemory(value));
    },
  };
};
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Home);
