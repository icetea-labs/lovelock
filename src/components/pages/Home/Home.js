import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { connect, useDispatch } from 'react-redux';
import { useSnackbar } from 'notistack';
import { FlexBox, FlexWidthBox, rem, LeftBoxWrapper } from '../../elements/StyledUtils';
import { LinkPro, ButtonPro } from '../../elements/Button';
import LeftContainer from '../Lock/LeftContainer';
import MemoryContainer from '../Memory/MemoryContainer';
import LandingPage from '../../layout/LandingPage';
import * as actions from '../../../store/actions';
import APIService from '../../../service/apiService';
import { showSubscriptionError } from '../../../helper';
import { getContract } from '../../../service/tweb3';

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
  const { setLocks, setMemory, address, locks, history } = props;
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    let cancel = false;
    if (address) {
      fetchData(cancel);
    }
    return () => {
      cancel = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchData(cancel) {
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

  function watchCreatePropose(signal) {
    const filter = {};
    return getContract().events.allEvents(filter, async (error, result) => {
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
          fetchData(signal);
        }
      }
    });
  }

  const renderHomeEmptyPropose = () => {
    watchCreatePropose();

    return (
      <FlexWidthBox>
        <ShadowBox>
          <RightBox>
            <div>
              <img src="/static/img/plant.svg" alt="plant" />
              <div className="emptyTitle">
                <h1>You have no lock yet.</h1>
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
