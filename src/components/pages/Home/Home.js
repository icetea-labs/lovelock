import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { connect, useDispatch } from 'react-redux';
import { FlexBox, FlexWidthBox, rem, LeftBoxWrapper } from '../../elements/StyledUtils';
import { LinkPro, ButtonPro } from '../../elements/Button';
import LeftContainer from '../Lock/LeftContainer';
import MemoryContainer from '../Memory/MemoryContainer';
import LandingPage from '../../layout/LandingPage';
import * as actions from '../../../store/actions';
import APIService from '../../../service/apiService';

const RightBoxMemories = styled.div`
  padding: 0 0 ${rem(45)} ${rem(45)};
  @media (max-width: 768px) {
    padding-left: 0;
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
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const { setLocks, setMemory, address, locks, history } = props;
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
      setLocks(resp.locks);
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
            <LeftBoxWrapper>
              <div className="proposeColumn proposeColumn--left">
                <LeftContainer loading={loading} />
              </div>
              <div className="proposeColumn proposeColumn--right">
                <RightBoxMemories>
                  <MemoryContainer memorydata={[]} />
                </RightBoxMemories>
              </div>
            </LeftBoxWrapper>
          ) : (
            <FlexBox wrap="wrap" justify="center">
              {renderHomeEmptyPropose}
              <FooterWapper>
                <SupportSite>
                  <p>
                    Powered by&nbsp;
                    <a href="https://icetea.io/" target="_blank" rel="noopener noreferrer">
                      Icetea Platform
                    </a>
                  </p>
                  <p className="footRight">
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
