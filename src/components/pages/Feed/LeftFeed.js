import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import { Typography } from '@material-ui/core';

import Icon from '../../elements/Icon';
import { LinkPro } from '../../elements/Button';
import LeftProposes from '../Propose/Detail/LeftProposes';
import { rem } from '../../elements/StyledUtils';
import * as actions from '../../../store/actions';
import { AvatarPro } from '../../elements';

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
  .feedBox {
    padding-bottom: 30px;
    .feedAvata {
      /* background:rebeccapurple; */
    }
    .feedName {
      font-size: 20px;
      line-height: 24px;
      margin-top: 5px;
    }
    .feedNick {
      font-size: 14px;
      line-height: 16px;
      color: rgba(0, 0, 0, 0.54);
      margin-top: 4px;
      cursor: pointer;
    }
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

const useStyles = makeStyles(theme => ({
  card: {
    width: '100%',
  },
  avatar: {
    width: 172,
    height: 172,
    // border: ['4px', 'solid', '#fff'].join(' '),
  },
}));

function LeftFeed(props) {
  const classes = useStyles();
  const { feedAddress, address } = props;
  const loading = false;
  function newLock() {}
  function selectAccepted() {}
  console.log('feedAddress', feedAddress);

  return (
    <React.Fragment>
      <LeftBox>
        <ShadowBox>
          <div className="feedBox">
            <div className="feedAvata">
              <AvatarPro alt="img" hash="QmXtwtitd7ouUKJfmfXXcmsUhq2nGv98nxnw2reYg4yncM" className={classes.avatar} />
            </div>
            <div className="feedName">Hoang Huy</div>
            <div className="feedNick">@HoangHuy226</div>
          </div>
          {address === feedAddress && (
            <LinkPro className="btn_add_promise" onClick={newLock}>
              <Icon type="add" />
              New Lock
            </LinkPro>
          )}
          <div className="title">Public lock</div>
          <div>
            <LeftProposes loading={loading} flag={1} handlerSelect={selectAccepted} />
          </div>
        </ShadowBox>
      </LeftBox>
    </React.Fragment>
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
  )(LeftFeed)
);
