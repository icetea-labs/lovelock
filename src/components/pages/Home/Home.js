import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { FlexBox, FlexWidthBox, rem } from '../../elements/StyledUtils';
import { LinkPro } from '../../elements/Button';
import { callView } from '../../../helper';
import * as actions from '../../../store/actions';
import Promise from '../Propose/Promise';

const RightBox = styled.div`
  padding: 0 ${rem(45)} ${rem(45)} ${rem(45)};
  justify-content: center;
  position: absolute;
  img {
    width: 200px;
    height: 200px;
  }
  h1,
  h2 {
    text-align: center;
  }
`;

const ActionForm = styled.div`
  margin: 30px auto;
`;

function Home(props) {
  const [openPromise, setOpenPromise] = useState(false);
  const { address, history, setNeedAuth, privateKey } = props;
  const [homePropose, setHomePropose] = useState([]);

  useEffect(() => {
    loadAcceptPropose();
  }, []);

  async function loadAcceptPropose() {
    let proposes;
    proposes = (await callView('getProposeByAddress', [address])) || [];
    proposes = proposes.filter(item => item.status === 1);
    setHomePropose(proposes);
    if (proposes.length > 0) {
      const index = proposes[0].id;
      history.push(`/lock/${index}`);
    }
  }

  function openPopup() {
    if (!privateKey) {
      setNeedAuth(true);
    }
    setOpenPromise(true);
  }

  function openExplore() {
    history.push('/explore');
  }

  function closePopup() {
    setOpenPromise(false);
    loadAcceptPropose();
  }

  return (
    address && (
      <FlexBox wrap="wrap" align="center" justify="space-between">
        {/* <FlexWidthBox width="30%"><LeftContrainer /></FlexWidthBox> */}
        {homePropose.length < 1 && (
          <FlexWidthBox>
            <RightBox>
              <div>
                <img src="/static/img/logo.svg" alt="logo" />
                <div>
                  <h1 className="emptyTitle">You have no locks yet.</h1>
                </div>
                <div>
                  <h2 className="emptySubTitle">Locks are the way you connect and</h2>
                  <h2 className="emptySubTitle">share memories with your loved ones.</h2>
                </div>
                <ActionForm>
                  <LinkPro className="btn_add_promise" onClick={openPopup}>
                    Create first lock
                  </LinkPro>
                  <LinkPro className="btn_add_promise" onClick={openExplore}>
                    or explore others.
                  </LinkPro>
                </ActionForm>
              </div>
            </RightBox>
            {openPromise && privateKey && <Promise close={closePopup} />}
          </FlexWidthBox>
        )}
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
