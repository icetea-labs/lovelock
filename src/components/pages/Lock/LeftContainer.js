import React, { useEffect } from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { FormattedMessage } from 'react-intl';
import StickyBox from 'react-sticky-box';
import { ensureContract } from '../../../service/tweb3';
import { rem } from '../../elements/StyledUtils';
import { callView, showSubscriptionError, TimeWithFormat } from '../../../helper';
import Icon from '../../elements/Icon';

import { LinkPro } from '../../elements/Button';
import { Lock } from '../../elements';
import * as actions from '../../../store/actions';

const LeftBox = styled.div`
  width: 100%;
  min-height: ${rem(360)};
  margin-bottom: ${rem(100)};
  i {
    padding: 0 5px;
  }
  .btn_add_promise {
    width: 172px;
    height: 46px;
    border-radius: 23px;
    font-weight: 600;
    font-size: ${rem(14)};
    color: #8250c8;
    border: 1px solid #8250c8;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 30px;
  }
  .title {
    color: #141927;
    font-weight: 600;
    font-size: ${rem(14)};
    text-transform: uppercase;
    margin-top: ${rem(30)};
    /* margin-bottom: ${rem(20)}; */
  }
  .title:first-of-type {
    margin-top: 0px;
  }
  @media (max-width: 768px) {
    min-height: auto;
    margin-bottom: ${rem(20)};
  }
`;
const ShadowBox = styled.div`
  padding: 30px;
  border-radius: 10px;
  background: #fff;
  box-shadow: '0 1px 4px 0 rgba(0, 0, 0, 0.15)';
  @media (max-width: 768px) {
    border-radius: 4px;
  }
`;

const CollectionBox = styled.div`
  padding-top: 1rem;
  width: 100%;
  display: block;
  .colName {
    color: #5a5e67;
    margin-right: ${rem(7)};
    font-size: ${rem(12)};
    cursor: pointer;
    margin-bottom: ${rem(9)};
    padding: 3px 12px 3px 6px;
    :hover {
      color: #8250c8;
      text-decoration: underline;
    }
    .material-icons {
      vertical-align: middle;
    }
    /* .colText {
    } */
  }
`;

const RecentImageBox = styled.div`
  padding-top: 1rem;
  width: 100%;
  display: block;
  img {
    width: 112px;
    height: 112px;
    padding-left: 2px;
    padding-bottom: 2px;
    object-fit: cover;
    cursor: pointer;
    :hover {
      opacity: 0.9;
    }
  }
`;

const RecentBlogPostBox = styled.ul`
  padding-top: 1rem;
  width: 100%;
  line-height: 1.5;
  li {
    padding: 0.2rem 0;
    a:hover {
      text-decoration: underline;
    }
    .date {
      font-size: 85%;
      color: #8f8f8f;
      margin-left: 0.2em;
    }
  }
`;

const SupportSite = styled.div`
  display: block;
  padding-top: 1rem;
  line-height: 18px;
  font-size: 12px;
  align-items: center;
  justify-content: center;
  width: auto;
  color: #90949c;
  a {
    color: inherit;
    &:hover {
      color: #8250c8;
      text-decoration: underline;
    }
  }
  @media (max-width: 768px) {
    padding-left: 2rem;
  }
`;

function LeftContainer(props) {
  const {
    locks,
    setLocks,
    showNewLock,
    setShowNewLockDialog,
    showNotifyLock,
    showPhotoViewer,
    confirmLock,
    topInfo,
    recentData,
    proIndex,
    address,
    history,
    loading,
    isGuest,
    closeMobileMenu,
    language,
    featured,
    context
  } = props;

  const isLockPage = proIndex != null;
  const shouldRenderRecent = ['mypage', 'lock'].includes(context)
  const collections = isLockPage && topInfo && topInfo.index === proIndex ? topInfo.collections || [] : [];
  const recentImages = shouldRenderRecent ? recentData.photos || {} : {};
  const hasRecentImages = !!Object.keys(recentImages).length;
  const recentBlogPosts = shouldRenderRecent ? recentData.blogPosts || [] : [];

  const { enqueueSnackbar } = useSnackbar();
  const ja = 'ja';

  useEffect(() => {
    const signal = {};
    let sub;
    ensureContract().then(c => {
      sub = watchCreatePropose(c, signal);
    });

    return () => {
      signal.cancel = true;
      if (sub && sub.unsubscribe) {
        sub.unsubscribe();
        sub = undefined;
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function watchCreatePropose(contract, signal) {
    const filter = {};
    return contract.events.allEvents(filter, async (error, result) => {
      if (signal && signal.cancel) return;

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
          eventCreatePropose(repsNew[0].eventData, signal);
        }

        const respConfirm = result.filter(({ eventName }) => {
          return eventName === 'confirmLock';
        });
        if (
          respConfirm.length > 0 &&
          (respConfirm[0].eventData.log.sender === address || respConfirm[0].eventData.log.receiver === address)
        ) {
          eventConfirmLock(respConfirm[0].eventData);
        }
      }
    });
  }

  const openPhotoViewer = event => {
    const currentIndex = Number(event.target.getAttribute('data-index')) || 0;
    const views = Object.keys(recentImages).map(hash => ({ source: process.env.REACT_APP_IPFS + hash }));
    const options = {
      currentIndex,
      views,
    };
    showPhotoViewer(options);
  };

  function selectAccepted(lockIndex, collectionId, username) {
    let url = username ? `/u/${username}` : `/lock/${lockIndex}`;
    if (collectionId != null) {
      url += `/collection/${collectionId}`;
    }
    history.push(url);
    window.scrollTo(0, 0);
    if (closeMobileMenu) closeMobileMenu();
  }

  function newLock() {
    setShowNewLockDialog(true);
    if (closeMobileMenu) closeMobileMenu();
  }

  function eventConfirmLock(data) {
    confirmLock(data.log);
    if (address === data.log.sender && data.log.status === 1) {
      const message = 'Your lock request has been accepted.';
      enqueueSnackbar(message, { variant: 'info' });
    }
  }

  async function eventCreatePropose(data) {
    const lockForFeed = await callView('getLocksForFeed', [address, true, false]);
    setLocks(lockForFeed.locks);

    // console.log(data);
    if (address !== data.log.sender) {
      const message = 'You have a new lock request.';
      enqueueSnackbar(message, { variant: 'info' });
    }
    // goto propose detail when sent to bot.
    if (data.log.receiver === process.env.REACT_APP_BOT_LOVER) {
      history.push(`/lock/${data.log.id}`);
    }
  }

  function renderCollections(_collections) {
    const cols = [{ name: 'All', description: 'All memories.' }].concat(_collections);
    return cols.map((item, index) => {
      return (
        <div className="colName" key={index} onClick={() => selectAccepted(proIndex, item.id)}>
          <Icon type="collections" />
          <span className="colText" title={item.description}>
            {item.name}
          </span>
        </div>
      );
    });
  }

  function renderRecentImages(images) {
    return Object.entries(images).map(([hash, data], index) => {
      return (
        <img
          key={index}
          data-index={index}
          onClick={openPhotoViewer}
          src={process.env.REACT_APP_IPFS + hash}
          title={data.content}
          alt={`${index + 1}`}
        />
      );
    });
  }

  function renderRecentBlogPosts(posts) {
    return posts.map(({ date, content, index }, i) => {
      return (
        <li key={i}>
          ・
          <a href={`/blog/${index}`}
            onClick={e => {
              e.preventDefault()
              const memo = props.memories.find(m => m.id === index)
              if (memo) {
                memo.showDetail = true;
                props.updateMemory(memo)
              } else {
                history.push(`/blog/${index}`)
              }
            }}
          >
            {content.meta.title}
          </a>
          <span className="date">
            ・<TimeWithFormat value={date} format="DD MMM YYYY" />
          </span>
        </li>
      );
    });
  }

  function renderOwnerLocks(locks, myAddress) {
    const newLocks = locks.filter(lock => {
      return lock.isMyLock;
    });
    const acceptedLocks = newLocks.filter(l => l.status === 1);
    const pendingLocks = newLocks.filter(l => l.status === 0);
    return (
      <>
        {!!acceptedLocks.length && (
          <>
            <div className="title">
              {!isGuest
                ? language === ja
                  ? 'マイロック'
                  : 'My lock'
                : language === ja
                ? '公開ロック '
                : 'Public lock'}
            </div>
            <div className="content">
              <Lock loading={loading} locksData={acceptedLocks} address={myAddress} handlerSelect={selectAccepted} />
            </div>
          </>
        )}
        {!isGuest && !!pendingLocks.length && (
          <>
            <div className="title">
              <FormattedMessage id="leftmenu.pendingLock" />
            </div>
            <div className="content">
              <Lock loading={loading} locksData={pendingLocks} address={myAddress} handlerSelect={showNotifyLock} />
            </div>
          </>
        )}
      </>
    );
  }

  function renderFeatured(locks) {
    return (
      <>
        <div className="title">
          <FormattedMessage id="leftmenu.featured" />
        </div>
        <div className="content">
          <Lock loading={loading} locksData={locks} handlerSelect={selectAccepted} />
        </div>
      </>
    );
  }

  function renderFollowingLocks(locks, myAddress) {
    const followingLocks = locks.filter(lock => {
      return lock.address || (!lock.isMyLock && lock.status === 1); // accepted
    });
    if (!followingLocks.length) return;

    return (
      <>
        <div className="title">
          <FormattedMessage id="leftmenu.folowingLock" />
        </div>
        <div className="content">
          <Lock loading={loading} locksData={followingLocks} address={myAddress} handlerSelect={selectAccepted} />
        </div>
      </>
    );
  }

  // Note: the StickyBox with position:sticky make dialogs, modals go into displaying ordering problems
  // so must put all modals and dialog outside of sticky box.
  // In the future, we should move all dialogs/modals to parent layer to avoid problems on mobile
  // where left sidebar is hidden
  return (
    <>
      <StickyBox className="sticky-leftside" offsetTop={20} offsetBottom={20}>
        <LeftBox>
          <ShadowBox>
            {address && showNewLock && (
              <LinkPro className="btn_add_promise" onClick={newLock}>
                <Icon type="add" />
                <FormattedMessage id="leftmenu.newLock" />
              </LinkPro>
            )}
            {!featured && renderOwnerLocks(locks, address)}
            {!featured && !isGuest && renderFollowingLocks(locks, address)}
            {featured && renderFeatured(locks)}
            {isLockPage && (
              <div className="title">
                <FormattedMessage id="leftmenu.collection" />
              </div>
            )}
            {isLockPage && <CollectionBox>{renderCollections(collections)}</CollectionBox>}
            {shouldRenderRecent && !!recentBlogPosts.length && <div className="title">Article</div>}
            {shouldRenderRecent && !!recentBlogPosts.length && (
              <RecentBlogPostBox>{renderRecentBlogPosts(recentBlogPosts)}</RecentBlogPostBox>
            )}
            {shouldRenderRecent && hasRecentImages && <div className="title">Photo</div>}
            {shouldRenderRecent && hasRecentImages && <RecentImageBox>{renderRecentImages(recentImages)}</RecentImageBox>}
          </ShadowBox>
          <SupportSite>
            <p>
              <a href="mailto:info@icetea.io" target="_blank" rel="noopener noreferrer">
                Email
              </a>
              &nbsp;ー&nbsp;
              <a href="https://t.me/iceteachainvn" target="_blank" rel="noopener noreferrer">
                Telegram
              </a>
            </p>
            <p>
              Powered by&nbsp;
              <a href="https://icetea.io/" target="_blank" rel="noopener noreferrer">
                Icetea Platform
              </a>
            </p>
          </SupportSite>
        </LeftBox>
      </StickyBox>
    </>
  );
}

const mapStateToProps = state => {
  return {
    locks: state.loveinfo.locks,
    address: state.account.address,
    topInfo: state.loveinfo.topInfo,
    memories: state.loveinfo.memories,
    recentData: state.loveinfo.recentData,
    language: state.globalData.language,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    setLocks: value => {
      dispatch(actions.setLocks(value));
    },
    updateMemory: memory => {
      dispatch(actions.updateMemory(memory));
    },
    setShowNewLockDialog: value => {
      dispatch(actions.setShowNewLockDialog(value));
    },
    confirmLock: value => {
      dispatch(actions.confirmLock(value));
    },
    showPhotoViewer(options) {
      dispatch(actions.setShowPhotoViewer(options));
    },
    showNotifyLock(lockIndex) {
      dispatch(actions.setNotifyLock({
        index: lockIndex,
        show: true
      }));
    },
  };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(LeftContainer));
