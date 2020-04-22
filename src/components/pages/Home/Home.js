import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { useSnackbar } from 'notistack';
import { FlexBox, LeftBoxWrapper } from '../../elements/StyledUtils';
import LeftContainer from '../Lock/LeftContainer';
import MemoryList from '../Memory/MemoryList';
import LandingPage from '../../layout/LandingPage';
import * as actions from '../../../store/actions';
import APIService from '../../../service/apiService';
// import { showSubscriptionError } from '../../../helper';
// import { ensureContract } from '../../../service/tweb3';
import appConstants from '../../../helper/constants';

import { useDidUpdate } from '../../../helper/hooks';
import EmptyPage from '../../layout/EmptyPage';

function Home(props) {
  const [loading, setLoading] = useState(true);
  const [changed, setChanged] = useState(false);
  const [page, setPage] = useState(1);
  const [noMoreMemories, setNoMoreMemories] = useState(false);

  const { setLocks, setMemories, address, locks, history, isApproved, memoryList } = props;
  // const { enqueueSnackbar } = useSnackbar();

  function refresh() {
    setChanged(c => !c);
  }

  useEffect(() => {
    const signal = {};
    fetchMemories(signal);
    return handleSignal(signal);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  useDidUpdate(() => {
    const signal = {};
    fetchMemories(signal, true);
    return handleSignal(signal);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [changed]);

  function handleSignal(signal) {
    return () => {
      signal.cancel = true;
      if (signal.sub && signal.sub.unsubscribe) {
        signal.sub.unsubscribe();
        delete signal.sub;
      }
    };
  }

  function fetchMemories(signal, loadToCurrentPage = false) {
    if (!address) return false;

    return APIService.getLocksForFeed(address, true, true)
      .then(resp => {

        // set to redux
        setLocks(resp.locks);
        if (signal.cancel) return;

        // Don't need to subscribe when no lock, because LeftContainer already do that
        // !resp.locks.length &&
        //   ensureContract().then(c => {
        //     signal.sub = watchCreatePropose(c, signal);
        //   });

        const memoIndex = resp.memoryIndexes

        if (memoIndex.length > 0) {
          APIService.getMemoriesByListMemIndex(memoIndex, page, appConstants.memoryPageSize, loadToCurrentPage)
            .then(result => {
              if (!result.length) {
                setNoMoreMemories(true);
              }

              let memories = result;
              if (page > 1 && !loadToCurrentPage) memories = memoryList.concat(result);
              setMemories(memories);
              setLoading(false);
            })
            .catch(err => {
              console.error(err);
              setLoading(false);
            });
        } else {
          setMemories([]);
          setNoMoreMemories(true);
          setLoading(false);
        }
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }

  // function watchCreatePropose(contract, signal) {
  //   const filter = {};
  //   return contract.events.allEvents(filter, async (error, result) => {
  //     if (signal.cancel) return;

  //     if (error) {
  //       showSubscriptionError(error, enqueueSnackbar);
  //     } else {
  //       const repsNew = result.filter(({ eventName }) => {
  //         return eventName === 'createLock';
  //       });

  //       if (
  //         repsNew.length > 0 &&
  //         (repsNew[0].eventData.log.sender === address || repsNew[0].eventData.log.receiver === address)
  //       ) {
  //         // navigate to the created lock (this should unsub the watch via useEffect)
  //         props.history.push(`/lock/${repsNew[0].eventData.log.id}`);
  //       }
  //     }
  //   });
  // }

  function nextPage() {
    if (noMoreMemories) return;
    setPage(page + 1);
  }

  const renderHomeEmptyPropose = () => {
    return <EmptyPage isApproved={isApproved} history={history} />
  };
  const isRegistered = !!address;
  const isHaveLocks = locks.length > 0;

  return isRegistered ? (
    <>
      {!loading && (
        <>
          {isHaveLocks ? (
            <LeftBoxWrapper>
              <div className="proposeColumn proposeColumn--left">
                <LeftContainer loading={loading} context="home" />
              </div>
              <div className="proposeColumn proposeColumn--right">
                <MemoryList {...props} onMemoryChanged={refresh} loading={loading} nextPage={nextPage} needSelectLock />
              </div>
            </LeftBoxWrapper>
          ) : (
            <FlexBox wrap="wrap" justify="center">
              {renderHomeEmptyPropose()}
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
    locks: state.loveinfo.locks,
    isApproved: state.account.isApproved,
    memoryList: state.loveinfo.memories,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    setLocks: value => {
      dispatch(actions.setLocks(value));
    },
    setMemories: value => {
      value.src = 'home'
      dispatch(actions.setMemories(value));
    },
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(Home);
