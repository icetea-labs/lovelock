import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { FlexBox, FlexWidthBox, rem } from '../../elements/StyledUtils';
import { LinkPro, ButtonPro } from '../../elements/Button';
import { callView } from '../../../helper';
import * as actions from '../../../store/actions';
import PuNewLock from '../Propose/PuNewLock';

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
  const [openPromise, setOpenPromise] = useState(false);
  const { address, history, setNeedAuth, tokenKey } = props;
  const [homePropose, setHomePropose] = useState([]);

  useEffect(() => {
    loadAcceptPropose();
  }, []);

  async function loadAcceptPropose() {
    let proposes;
    if (address) {
      proposes = (await callView('getProposeByAddress', [address])) || [];
      proposes = proposes.filter(item => item.status === 1);
      setHomePropose(proposes);
      if (proposes.length > 0) {
        const index = proposes[0].id;
        history.push(`/lock/${index}`);
      }
    }
  }

  function openPopup() {
    if (!tokenKey) {
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
      <FlexBox wrap="wrap" justify="center">
        {/* <FlexWidthBox width="30%"><LeftContainer /></FlexWidthBox> */}
        {homePropose.length < 1 && (
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
                    or explore others'
                  </LinkPro>
                </div>
              </RightBox>
            </ShadowBox>
            {openPromise && tokenKey && <PuNewLock close={closePopup} />}
          </FlexWidthBox>
        )}
      </FlexBox>
    )
  );
}

const mapStateToProps = state => {
  return {
    address: state.account.address,
    tokenKey: state.account.tokenKey,
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
