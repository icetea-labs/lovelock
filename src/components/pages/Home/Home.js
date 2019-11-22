import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { FlexBox, FlexWidthBox, rem } from '../../elements/StyledUtils';
import { LinkPro, ButtonPro } from '../../elements/Button';
import { callView } from '../../../helper';
import * as actions from '../../../store/actions';
import PuNewLock from '../Propose/PuNewLock';
import LandingPage from '../../layout/LandingPage';
import FeedContainer from '../Feed';

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

const FooterWapper = styled.div`
  height: 20px;
  line-height: 20px;
  background: #fff;
  width: 100%;
  color: #737373;
  display: flex;
  font-size: 12px;
  font-weight: 300px;
  border-top: 1px solid #e6ecf0;
  justify-content: center;
  padding: 8px 0;
  position: fixed;
  bottom: 0;
  left: 0;
  z-index: 1;
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
  const [openPromise, setOpenPromise] = useState(false);
  const { address, history } = props;
  const [homePropose, setHomePropose] = useState(null);

  useEffect(() => {
    loadAcceptPropose();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address]);

  function loadAcceptPropose() {
    if (address) {
      callView('getProposeByAddress', [address]).then(proposes => {
        setHomePropose(proposes || []);
      });
    }
  }

  useEffect(() => {
    if (homePropose && homePropose.length > 0) {
      const pro = homePropose.filter(item => item.status === 1);
      let index;
      if (pro.length > 0) {
        index = pro[0].id;
      } else {
        index = homePropose[0].id;
      }
      // history.push(`/lock/${index}`);
    }
  }, [homePropose, history]);

  function openPopup() {
    setOpenPromise(true);
  }

  function openExplore() {
    history.push('/explore');
  }

  function closePopup() {
    setOpenPromise(false);
    loadAcceptPropose();
  }

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
      {openPromise && <PuNewLock close={closePopup} />}
    </FlexWidthBox>
  );

  return address ? (
    <>
      {homePropose && homePropose.length < 1 ? (
        <FlexBox wrap="wrap" justify="center">
          {renderHomeEmptyPropose}
          <FooterWapper>
            <SupportSite>
              <p>
                &copy; 2019&nbsp;
                <a href="https://trada.tech" target="_blank" rel="noopener noreferrer">
                  Trada Technology
                </a>
              </p>
            </SupportSite>
            <SupportSite>
              <div className="footRight">
                <p>
                  Email:&nbsp;
                  <a href="mailto:info@icetea.io" target="_blank" rel="noopener noreferrer">
                    info@icetea.io
                  </a>
                </p>
              </div>
              <div className="footRight">
                <p>
                  Telegram:&nbsp;
                  <a href="https://t.me/iceteachain" target="_blank" rel="noopener noreferrer">
                    Icetea Vietnam
                  </a>
                </p>
              </div>
            </SupportSite>
          </FooterWapper>
        </FlexBox>
      ) : (
        <FeedContainer />
      )}
    </>
  ) : (
    <LandingPage />
  );
}

const mapStateToProps = state => {
  return {
    address: state.account.address,
  };
};

export default connect(
  mapStateToProps,
  null
)(Home);
