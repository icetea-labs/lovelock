import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { connect, useSelector } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import { Button, Typography } from '@material-ui/core';
import BookmarkIcon from '@material-ui/icons/Bookmark';
import BookmarkBorderIcon from '@material-ui/icons/BookmarkBorder';
import { useSnackbar } from 'notistack';

import { rem, LeftBoxWrapper } from '../../elements/StyledUtils';
import LeftContainer from '../Lock/LeftContainer';
import MemoryContainer from '../Memory/MemoryContainer';
import { AvatarPro } from '../../elements';
import { callView } from '../../../helper';
import { useTx } from '../../../helper/hooks';
import * as actions from '../../../store/actions';
import APIService from '../../../service/apiService';

const RightBoxMemories = styled.div`
  padding: 0 0 ${rem(45)} ${rem(45)};
  @media (max-width: 768px) {
    padding-left: 0;
  }
`;
const BannerContainer = styled.div`
  margin-bottom: ${rem(20)};
`;
const ShadowBox = styled.div`
  padding: 30px 30px 10px 30px;
  border-radius: 10px;
  background: linear-gradient(340deg, #8dc1fe, #ad76ff);
  box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.15);
  @media (max-width: 768px) {
    padding: 16px;
  }
`;

const ProfileCover = styled.div``;
const CoverBox = styled.div`
  text-align: center;
`;
const NavbarBox = styled.div`
  .proLike {
    display: flex;
    height: 50px;
    padding: 8px 0;
    box-sizing: border-box;
    justify-content: flex-end;
  }
`;

const useStyles = makeStyles(theme => ({
  avatar: {
    width: 126,
    height: 126,
    margin: '0 auto',
  },
  displayName: {
    paddingTop: theme.spacing(1),
    textTransform: 'capitalize',
  },
  btLikeFollow: {
    color: theme.palette.text.secondary,
    // color: '#fff',
    // background: '#92b5fe',
    marginLeft: theme.spacing(1),
  },
}));

function Mypage(props) {
  const { match, setLocks, setMemory } = props;
  const classes = useStyles();
  const tx = useTx();
  const { enqueueSnackbar } = useSnackbar();
  const address = useSelector(state => state.account.address);
  const tokenAddress = useSelector(state => state.account.tokenAddress);
  const [loading, setLoading] = useState(true);
  const [myPageInfo, setMyPageInfo] = useState({
    avatar: '',
    username: '',
    displayname: '',
    numFollow: 0,
    isMyFollow: false,
  });

  let paramAddress = match.params.address;
  if (!paramAddress) paramAddress = address;
  // setLoading(false);

  useEffect(() => {
    async function getData() {
      callView('getDataForMypage', [paramAddress]).then(data => {
        const info = {};
        info.avatar = data[0].avatar;
        info.username = data[0].username;
        info.displayname = data[0]['display-name'];
        info.followed = data[0].followed;
        const { numFollow, isMyFollow } = serialFollowData(data[0].followed);
        info.numFollow = numFollow;
        info.isMyFollow = isMyFollow;
        setMyPageInfo(info);
      });
    }

    getData();
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramAddress]);

  async function fetchData() {
    APIService.getLocksForFeed(paramAddress).then(resp => {
      // set to redux
      setLocks(resp.locks);

      const memoIndex = resp.locks.reduce((tmp, lock) => {
        return lock.isMyLocks ? tmp.concat(lock.memoIndex) : tmp;
      }, []);
      // console.log('memoIndex', memoIndex.length);
      memoIndex.length > 0 &&
        APIService.getMemoriesByListMemIndex(memoIndex).then(mems => {
          // console.log('mems', mems);
          // set to redux
          setMemory(mems);
        });
      setLoading(false);
    });
  }
  function serialFollowData(follow) {
    if (!follow) return { numFollow: 0, isMyFollow: false };
    const isMyFollow = follow.includes(address);
    const num = follow.length;
    return { numFollow: num, isMyFollow };
  }

  function getNumTopFollow(_numFollow, _isMyFollow) {
    callView('getFollowedPerson', [paramAddress]).then(data => {
      const { numFollow, isMyFollow } = serialFollowData(data);
      if (_numFollow !== numFollow || _isMyFollow !== isMyFollow) {
        setMyPageInfo({ ...myPageInfo, numFollow, isMyFollow });
      }
    });
  }

  function handerFollow() {
    try {
      let { numFollow, isMyFollow } = myPageInfo;
      if (isMyFollow) {
        numFollow -= 1;
      } else {
        numFollow += 1;
      }
      isMyFollow = !isMyFollow;
      setMyPageInfo({ ...myPageInfo, numFollow, isMyFollow });

      tx.sendCommit('followPerson', paramAddress, { tokenAddress, address }).then(() => {
        getNumTopFollow(numFollow, isMyFollow);
      });
    } catch (error) {
      console.error(error);
      const message = `An error occurred, please try again later`;
      enqueueSnackbar(message, { variant: 'error' });
    }
  }
  return (
    <div>
      <BannerContainer>
        <ShadowBox>
          <ProfileCover>
            <CoverBox>
              <AvatarPro hash={myPageInfo.avatar} className={classes.avatar} />
              <div>
                <Typography variant="h5" className={classes.displayName}>
                  {myPageInfo.displayname}
                </Typography>
                <Typography variant="subtitle1" className={classes.username} color="primary">
                  {`@${myPageInfo.username}`}
                </Typography>
              </div>
            </CoverBox>
            <NavbarBox>
              <div className="proLike">
                {/* <Button>Timeline</Button> */}
                {/* <Button>Photos</Button> */}
                <Button onClick={handerFollow} className={classes.btLikeFollow}>
                  {myPageInfo.isMyFollow ? (
                    <>
                      <BookmarkIcon color="primary" className={classes.rightIcon} />
                      <Typography component="span" variant="body2" color="primary" className={classes.textFollow}>
                        Following {myPageInfo.numFollow > 0 && `(${myPageInfo.numFollow})`}
                      </Typography>
                    </>
                  ) : (
                    <>
                      <BookmarkBorderIcon className={classes.rightIcon} />
                      <Typography component="span" variant="body2" className={classes.textFollow}>
                        Follow {myPageInfo.numFollow > 0 && `(${myPageInfo.numFollow})`}
                      </Typography>
                    </>
                  )}
                </Button>
              </div>
            </NavbarBox>
          </ProfileCover>
        </ShadowBox>
      </BannerContainer>
      <LeftBoxWrapper>
        <div className="proposeColumn proposeColumn--left">
          <LeftContainer loading={loading} isGuest={address !== paramAddress} />
        </div>
        <div className="proposeColumn proposeColumn--right">
          <RightBoxMemories>
            <MemoryContainer memorydata={[]} />
          </RightBoxMemories>
        </div>
      </LeftBoxWrapper>
    </div>
  );
}
const mapStateToProps = state => {
  return {
    address: state.account.address,
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
)(Mypage);
