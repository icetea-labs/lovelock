import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { connect, useDispatch } from 'react-redux';
import { useSnackbar } from 'notistack';
import { FlexBox, FlexWidthBox, rem, LeftBoxWrapper } from '../../elements/StyledUtils';
import { LinkPro, ButtonPro } from '../../elements/Button';
import LeftContainer from '../Lock/LeftContainer';
import MemoryList from '../Memory/MemoryList';
import LandingPage from '../../layout/LandingPage';
import * as actions from '../../../store/actions';
import APIService from '../../../service/apiService';
import { showSubscriptionError } from '../../../helper';
import { ensureContract } from '../../../service/tweb3';
import appConstants from "../../../helper/constants";

const RightBox = styled.div`
  text-align: center;
  padding: ${rem(30)};
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
  img {
    max-width: 158px;
  }
  .note {
    padding: 12px 12px 12px 20px;
    background-color: #fe7;
    line-height: 1.4;
    text-align: left;
    margin-top: -1.5rem;
    margin-bottom: 2rem;
    border-radius: 6px;
    h5 {
      font-weight: 700;
      margin-bottom: .5rem;
    }
  }
  @media (max-width: 768px) {
    img {
      width: 25vw;
    }
  }
`;

const ActionForm = styled.div`
  margin-top: 20px;
`;

const ShadowBox = styled.div`
  margin-top: ${rem(95)};
  padding: ${rem(30)};
  border-radius: 10px;
  background: #f5f5f8;
  box-shadow: '0 1px 4px 0 rgba(0, 0, 0, 0.15)';
  @media (max-width: 768px) {
    margin-top: 0;
    height: 125%;
  }
`;

const FooterWapper = styled.div`
  height: 20px;
  line-height: 20px;
  padding-top: 30px;
  /* background: #fff; */
  width: 100%;
  color: #737373;
  font-size: 12px;
  font-weight: 300px;
  border-top: 1px solid #e6ecf0;
  justify-content: center;
  /* position: fixed; */
  left: 0;
  z-index: 1;
  @media (max-width: 768px) {
    justify-content: flex-start;
    display: none;
  }
`;
const DownInfo = styled.div`
  height: 20px;
  width: 100%;
  color: #737373;
  font-size: 12px;
  font-weight: 300px;
  border-top: 1px solid #e6ecf0;
  justify-content: center;
  left: 0;
  @media (max-width: 768px) {
    justify-content: flex-start;
    display: none;
  }
`;

const SupportSite = styled.div`
  display: flex;
  margin: 3px 0;
  line-height: 18px;
  align-items: center;
  justify-content: center;
  width: auto;
  a {
    color: inherit;
    &:hover {
      color: #8250c8;
      text-decoration: underline;
    }
  }
  .footRight {
    margin-left: 15px;
  }
`;

function Home(props) {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [changed, setChanged] = useState(false);
  const [page, setPage] = useState(1);
  const [noMoreMemories, setNoMoreMemories] = useState(false);

  const { setLocks, setMemory, address, locks, history, isApproved, memoryList } = props;
  const { enqueueSnackbar } = useSnackbar();

  function refresh() {
    setChanged(c => !c);
  }

  useEffect(() => {
    const signal = {};
    fetchMemories(signal);
    return handleSignal(signal);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);


  useEffect(() => {
    const signal = {};
    fetchMemories(signal, true);
    return handleSignal(signal);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [changed]);

  function handleSignal(signal) {
    return () => {
      signal.cancel = true
      if (signal.sub && signal.sub.unsubscribe) {
        signal.sub.unsubscribe()
        delete signal.sub
      }
    };
  }

  function fetchMemories(signal, loadToCurrentPage = false) {
    if (!address) return false;

    return APIService.getLocksForFeed(address).then(resp => {
      // set to redux
      setLocks(resp.locks);
      if (signal.cancel) return;

      // Don't need to subscribe when no lock, because LeftContainer already do that
      !resp.locks.length && ensureContract().then(c => {
        signal.sub = watchCreatePropose(c, signal)
      })

      const memoIndex = resp.locks.reduce((tmp, lock) => {
        return tmp.concat(lock.memoIndex);
      }, []);

      if (memoIndex.length > 0) {
        APIService.getMemoriesByListMemIndex(memoIndex, page, appConstants.memoryPageSize, loadToCurrentPage).then(result => {
          if (!result.length) {
            setNoMoreMemories(true);
            setLoading(false);
            return;
          }

          let memories = result;
          if (!loadToCurrentPage) memories = memoryList.concat(result);
          setMemory(memories);
          setLoading(false);
        });
      }
    });
  }

  function openPopup() {
    dispatch(actions.setNewLock(true));
  }

  function openLink(event) {
    event.preventDefault()
    history.push(event.currentTarget.getAttribute('route'));
  }

  function watchCreatePropose(contract, signal) {
    const filter = {};
    return contract.events.allEvents(filter, async (error, result) => {
      if (signal.cancel) return

      if (error) {
        showSubscriptionError(error, enqueueSnackbar);
      } else {
        const repsNew = result.filter(({ eventName }) => {
          return eventName === 'createLock';
        });

        if (
          repsNew.length > 0 &&
          (repsNew[0].eventData.log.sender === address || repsNew[0].eventData.log.receiver === address)
        ) {
          // navigate to the created lock (this should unsub the watch via useEffect)
          props.history.push(`/lock/${repsNew[0].eventData.log.id}`);
        }
      }
    });
  }

  function nextPage() {
    if (noMoreMemories) return;
    setPage(page + 1);
  }

  const renderHomeEmptyPropose = () => {
    return (
      <FlexWidthBox>
        <ShadowBox>
          <RightBox>
            <div>
              {!isApproved && (
                <div className="note">
                  <h5>ACCOUNT ACTIVATION REQUIRED</h5>
                  <span>LoveLock is in beta and not yet open to public. Please <a className="underline" target="_blank" rel="noopener noreferrer" href="http://bit.ly/LoveLock-AAR">fill in this form</a> to request activation of your account before you can post contents.</span>
                </div>
              )}
              <img src="/static/img/plant.svg" alt="plant" />
              <div className="emptyTitle">
                <h1>You have no lock</h1>
              </div>
              <div className="emptySubTitle">
                <h2>
                  <span>Create locks to connect and share memories with your loved ones. </span>
                  <a href="https://help.lovelock.one/" className="underline" target="_blank" rel="noopener noreferrer">
                    Learn more...
                  </a>
                </h2>
              </div>
              <ActionForm>
                <ButtonPro variant="contained" color="primary" onClick={openPopup}>
                  Create First Lock
                </ButtonPro>
              </ActionForm>
              <LinkPro className="btn_add_promise" route="/explore" onClick={openLink}>
                Explore Notable Blogs
              </LinkPro>
            </div>
          </RightBox>
        </ShadowBox>
        <FooterWapper>
          <SupportSite className="upInfo">
            <p>
              Powered by&nbsp;
              <a href="https://icetea.io/" target="_blank" rel="noopener noreferrer">
                Icetea Platform.
              </a>
            </p>
            <p>
              &nbsp;
              <a href="https://trada.tech" target="_blank" rel="noopener noreferrer">
                Trada Technology&nbsp;
              </a>
              &copy; 2019
            </p>
          </SupportSite>
        </FooterWapper>
        <DownInfo>
          <SupportSite>
            <p>
              Need support? Contact us via&nbsp;
              <a href="mailto:info@icetea.io" target="_blank" rel="noopener noreferrer">
                Email
              </a>
              &nbsp;or&nbsp;
              <a href="https://t.me/iceteachainvn" target="_blank" rel="noopener noreferrer">
                Telegram.
              </a>
            </p>
          </SupportSite>
        </DownInfo>
      </FlexWidthBox>
    );
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
                <LeftContainer loading={loading} />
              </div>
              <div className="proposeColumn proposeColumn--right">
                <MemoryList
                  {...props}
                  onMemoryChanged={refresh}
                  loading={loading}
                  nextPage={nextPage}
                />
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
    memoryList: state.loveinfo.memories
  };
};

const mapDispatchToProps = dispatch => {
  return {
    setLocks: value => {
      dispatch(actions.setLocks(value));
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
