import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { rem } from '../../elements/StyledUtils';
import Icon from '../../elements/Icon';
import { LinkPro } from '../../elements/Button';
import { Lock } from '../../elements';

import * as actions from '../../../store/actions';
// import PuNewLock from '../PuNewLock';
// import PromiseAlert from '../PromiseAlert';
// import PromiseConfirm from '../PromiseConfirm';

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
    /* margin-bottom: ${rem(20)}; */
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
    .colText {
    }
  }
`;

function LeftContainer(props) {
  const {
    proposes,
    setProposes,
    addPropose,
    confirmPropose,
    topInfo,
    proIndex,
    address,
    tokenAddress,
    tokenKey,
    setNeedAuth,
    history,
  } = props;

  const collections = topInfo && topInfo.index === proIndex ? topInfo.collections || [] : [];

  // const [loading, setLoading] = useState(true);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {}, []);

  function selectAccepted(lockIndex, collectionId) {
    let url = `/lock/${lockIndex}`;
    if (collectionId != null) {
      url += `/collection/${collectionId}`;
    }
    history.push(url);
  }

  function newLock() {
    if (!tokenKey) {
      setNeedAuth(true);
    }
  }

  function selectPending(lockIndex) {
    if (!tokenKey) {
      setNeedAuth(true);
    }
  }

  function renderCollections(collec) {
    const cols = [{ name: 'All', description: 'All memories.' }].concat(collec);
    return cols.map((item, i) => {
      return (
        <div className="colName" key={i} onClick={() => selectAccepted(proIndex, item.id)} role="button">
          <Icon type="collections" />
          <span className="colText" title={item.description}>
            {item.name}
          </span>
        </div>
      );
    });
  }

  function renderOwnerLocks(locks, myAddress) {
    // tmp condition
    const loading = locks.length <= 0;
    const newLocks = locks.filter(lock => {
      return lock.isMyLocks;
    });
    return (
      <>
        <div className="title">My lock</div>
        <div>
          <Lock loading={loading} locksData={newLocks} address={myAddress} flag={1} handlerSelect={selectAccepted} />
        </div>
        <div className="title">Pending lock</div>
        <div>
          <Lock loading={loading} locksData={newLocks} address={myAddress} flag={0} handlerSelect={selectPending} />
        </div>
      </>
    );
  }

  function renderFollowingLocks(locks, myAddress) {
    // tmp condition
    const loading = locks.length <= 0;
    const newLocks = locks.filter(lock => {
      return !lock.isMyLocks;
    });
    return (
      <>
        <div className="title">Following lock</div>
        <div>
          <Lock loading={loading} locksData={newLocks} address={myAddress} flag={1} handlerSelect={selectAccepted} />
        </div>
      </>
    );
  }

  return (
    <>
      <LeftBox>
        <ShadowBox>
          {address && (
            <LinkPro className="btn_add_promise" onClick={newLock}>
              <Icon type="add" />
              New Lock
            </LinkPro>
          )}
          {renderOwnerLocks(proposes, address)}
          {renderFollowingLocks(proposes, address)}
          <div className="title">Collection</div>
          <CollectionBox>{renderCollections(collections)}</CollectionBox>
        </ShadowBox>
      </LeftBox>
    </>
  );
}

const mapStateToProps = state => {
  return {
    proposes: state.loveinfo.proposes,
    address: state.account.address,
    topInfo: state.loveinfo.topInfo,
    tokenAddress: state.account.tokenAddress,
    tokenKey: state.account.tokenKey,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    setProposes: value => {
      dispatch(actions.setPropose(value));
    },
    addPropose: value => {
      dispatch(actions.addPropose(value));
    },
    confirmPropose: value => {
      dispatch(actions.confirmPropose(value));
    },
    setNeedAuth: value => {
      dispatch(actions.setNeedAuth(value));
    },
  };
};

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(LeftContainer)
);
