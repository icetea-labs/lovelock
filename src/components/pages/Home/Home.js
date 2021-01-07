import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
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
import { getAlias } from '../../../helper';
import { IceteaId } from 'iceteaid-web';
import TryIceteaIdModal from '../../elements/TryIceteaIdModal';
const i = new IceteaId('xxx');

function Home(props) {
  const { setLocks, setMemories, address, locks, history, isApproved, memoryList } = props;
  const needToLoadData = Boolean(address && isApproved);
  const notOwnMemorySrc = memoryList.src !== 'home';

  const [loading, setLoading] = useState(needToLoadData && notOwnMemorySrc);
  const [changed, setChanged] = useState(false);
  const [page, setPage] = useState(1);
  const [noMoreMemories, setNoMoreMemories] = useState(false);
  const [memoryIndexes, setMemoryIndexes] = useState([]);
  const [openModal, setOpenModal] = useState(false);

  // const { enqueueSnackbar } = useSnackbar();

  function refresh() {
    setChanged((c) => !c);
  }

  useEffect(() => {
    const shouldOpenModal = async () => {
      const username = await getAlias(address);
      let usernameExist;
      if (username) {
        usernameExist = await i.auth.isRegister(username);
      }
      const addressExist = await i.auth.exIsRegister(address);

      if (!usernameExist && !addressExist) {
        setOpenModal(true);
      }
    };
    shouldOpenModal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!needToLoadData) return;

    if (page !== 1) {
      setPage(1);
      setNoMoreMemories(false);
    }

    const signal = {};
    getData(signal);
    return handleSignal(signal);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useDidUpdate(() => {
    if (page === 1 || noMoreMemories) return;

    const signal = {};
    getData(signal);
    return handleSignal(signal);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  useDidUpdate(() => {
    const signal = {};
    getData(signal, true);
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

  async function getLocksForFeed(signal, forced) {
    if (forced || notOwnMemorySrc || page === 1) {
      setLoading(true);
      setMemories([]);
      return APIService.getLocksForFeed(address, true, true).then((r) => {
        if (signal.cancel) return;

        setLocks(r.locks);
        setMemoryIndexes(r.memoryIndexes);
        return r;
      });
    } else {
      return { locks, memoryIndexes };
    }
  }

  function getData(signal, forced) {
    if (!needToLoadData) return;
    return getLocksForFeed(signal, forced)
      .then((r) => {
        if (signal.cancel) return;
        if (r.memoryIndexes.length) {
          fetchMemories(signal, r.memoryIndexes, forced);
        } else {
          setLoading(false);
        }
      })
      .catch((err) => {
        setLoading(false);
        console.error(err);
      });
  }

  function fetchMemories(signal, memoryIndexes, loadToCurrentPage = false) {
    return APIService.getMemoriesByListMemIndex(memoryIndexes, page, appConstants.memoryPageSize, loadToCurrentPage)
      .then((result) => {
        if (signal.cancel) return;
        if (result.length < appConstants.memoryPageSize) {
          setNoMoreMemories(true);
        }

        let memories = result;
        if (page > 1 && !loadToCurrentPage) memories = memoryList.concat(result);
        setMemories(memories);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }

  function nextPage() {
    if (noMoreMemories) return;
    setPage(page + 1);
  }

  const renderHomeEmptyPropose = () => {
    return <EmptyPage isApproved={isApproved} history={history} />;
  };
  const isRegistered = !!address;
  const isHaveLocks = locks.length > 0;

  return isRegistered ? (
    <>
      {!loading && (
        <>
          <TryIceteaIdModal open={openModal} setOpen={setOpenModal} />
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

const mapStateToProps = (state) => {
  return {
    address: state.account.address,
    locks: state.loveinfo.locks,
    isApproved: state.account.isApproved,
    memoryList: state.loveinfo.memories,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    setLocks: (value) => {
      dispatch(actions.setLocks(value));
    },
    setMemories: (value) => {
      value.src = 'home';
      dispatch(actions.setMemories(value));
    },
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(Home);
