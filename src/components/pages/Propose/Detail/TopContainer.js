import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch, connect } from 'react-redux';
import styled from 'styled-components';
import { makeStyles } from '@material-ui/core/styles';
import CardHeader from '@material-ui/core/CardHeader';
import Skeleton from '@material-ui/lab/Skeleton';
import { CardMedia, Button, Typography } from '@material-ui/core';
import PhotoCameraIcon from '@material-ui/icons/PhotoCamera';
import FavoriteIcon from '@material-ui/icons/Favorite';
import FavoriteBorderIcon from '@material-ui/icons/FavoriteBorder';
import { useSnackbar } from 'notistack';

// import tweb3 from '../../../../service/tweb3';

import {
  callView,
  summaryDayCal,
  HolidayEvent,
  TimeWithFormat,
  saveFileToIpfs,
  sendTransaction,
} from '../../../../helper';
import * as actions from '../../../../store/actions';
import { FlexBox, FlexWidthBox, rem } from '../../../elements/StyledUtils';
import { AvatarPro } from '../../../elements';
import ImageCrop from '../../../elements/ImageCrop';

const TopContainerBox = styled.div`
  .top__coverimg {
    position: relative;
    overflow: hidden;
    max-width: ${rem(900)};
    /* max-height: ${rem(425)}; */
    min-height: ${rem(225)};
    .showChangeImg {
      display: none;
    }
    &:hover {
      .showChangeImg {
        display: block;
        position: absolute;
        top: 5px;
        left: 5px;
      }
    }
    img {
      width: 100%;
      height: 100%;
    }
    input[type='file'] {
      font-size: 100px;
      position: absolute;
      top: 0;
      opacity: 0;
      cursor: pointer;
    }
    .fileInput {
      width: 100px;
      height: 30px;
      padding: 2px;
      margin: 10px;
      cursor: pointer;
    }
    .MuiSvgIcon-root {
      position: relative;
      overflow: hidden;
      display: inline-block;
      cursor: pointer;
    }
  }
  .top__title {
    display: flex;
    align-items: center;
    padding: ${rem(20)} 0;
    border-bottom: 1px dashed #ebebeb;
    img {
      padding-right: ${rem(15)};
    }
    .title__content {
      color: #8250c8;
      font-weight: 600;
      width: 100%;
      text-align: left;
    }
    .title__date {
      color: #8f8f8f;
    }
  }
`;
const WarrperChatBox = styled(FlexBox)`
  margin-top: ${rem(15)};
  /* & > div:first-child {
    padding-right: ${rem(15)};
  } */
  div:nth-child(even) .content_detail p {
    background-image: -webkit-linear-gradient(128deg, #ad76ff, #8dc1fe);
    background-image: linear-gradient(322deg, #ad76ff, #8dc1fe);
  }
  .proposeMes {
    display : flex;
  }
  .user_photo {
    display: block;
    img {
      width: 58px;
      height: 58px;
      border-radius: 10px;
    }
    object-fit: contain;
    overflow: hidden;
  }
  .name_time {
    .user_name {
      font-weight: 600;
      text-transform: capitalize;
      color: #8250c8;
      width: 100%;
    }
    .time {
      font-size: ${rem(12)};
      color: #8f8f8f;
    }
  }
  .content_detail {
    display: block;
    width: calc(100% - 58px - 15px);
    padding: 0 ${rem(10)};
  }
  .sinceDate {
    color: #8f8f8f;
    margin: 0 5px 0 5px;
  }
  .fl {
    float: left;
  }
  .fr {
    float: right;
  }
  .clearfix::after {
    display: block;
    clear: both;
    content: "";
  }
  .contentPage {
    margin-top: 23px;
  }
  .rightContent {
      text-align: right;
    }
  p {
    display: block;
    padding: ${rem(11)} ${rem(14)};
    font-size: ${rem(12)};
    line-height: ${rem(18)};
    color: #ffffff;
    border-radius: 10px;
    margin-top: 10px;
    box-shadow: 0 6px 12px 0 rgba(0, 0, 0, 0.1);
    background-image: -webkit-linear-gradient(113deg, #76a8ff, #8df6fe);
    background-image: linear-gradient(337deg, #76a8ff, #8df6fe);
  }
`;

const SummaryCard = styled.div`
  display: flex;
  justify-content: space-between;
  .dayago {
    display: flex;
    align-items: flex-end;
    img {
      width: 50px;
      height: 50px;
      object-fit: contain;
    }
    .summaryDay {
      margin-left: 7px;
      margin-bottom: 12px;
    }
    .summaryCongrat {
      text-align: center;
      margin: 7px;
      height: 36px;
      border-radius: 18px;
      background-color: #fdf0f6;
      font-size: 12px;
      font-weight: 500;
      color: #87198d;
      .congratContent {
        padding: 12px;
      }
    }
  }
  .proLike {
    display: flex;
  }
`;

const useStyles = makeStyles(theme => ({
  card: {
    width: '100%',
  },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 10,
  },
  media: {
    height: 0,
    paddingTop: '56.25%', // 16:9
    position: 'relative',
    overflow: 'hidden',
    backgroundSize: 'cover',
    '&:hover': {
      '& $icon': {
        // display: 'flex',
        // alignItem: 'center',
      },
    },
  },
  icon: {
    margin: theme.spacing(1),
    fontSize: '12px',
    color: 'white',
    // display: 'none',
  },
  photoCameraIcon: {
    marginRight: theme.spacing(1),
    marginTop: theme.spacing(0.5),
  },
  button: {
    margin: theme.spacing(1),
    opacity: 0.8,
    '&:hover': {
      background: 'linear-gradient(332deg, #591ea5, #fe8dc3)',
      opacity: 1,
    },
  },
  changeCoverTitle: {
    marginTop: '4px',
  },
  title: {
    display: 'none',
    color: '#fff',
    [theme.breakpoints.up('sm')]: {
      display: 'block',
      minWidth: 50,
      // margin: theme.spacing(0, 3, 0, 0),
      textTransform: 'capitalize',
    },
  },
  rightIcon: {
    margin: theme.spacing(0, 1),
    fontWeight: 700,
  },
}));

function TopContrainer(props) {
  const { proIndex, setNeedAuth, topInfo, setTopInfo, setGLoading } = props;
  const dispatch = useDispatch();
  const tokenAddress = useSelector(state => state.account.tokenAddress);
  const tokenKey = useSelector(state => state.account.tokenKey);
  const address = useSelector(state => state.account.address);

  const [loading, setLoading] = useState(true);
  const { enqueueSnackbar } = useSnackbar();
  const diffDate = summaryDayCal(topInfo.s_date);

  const needUpdate = !topInfo || proIndex !== topInfo.index;

  useEffect(() => {
    async function setProposeLikeInfo() {
      let likeData = {};
      if (topInfo.memoryRelationIndex || topInfo.memoryRelationIndex === 0) {
        const likes = await callView('getLikeByMemoIndex', [topInfo.memoryRelationIndex]);
        likeData = serialLikeData(likes);
      }
      const followData = serialFollowData(topInfo.follows);
      setTopInfo(Object.assign({}, topInfo, likeData, followData));
    }

    setLoading(needUpdate);
    if (!needUpdate) {
      setProposeLikeInfo();
    }
  }, [needUpdate]); // eslint-disable-line react-hooks/exhaustive-deps

  function handerLike() {
    try {
      if (!tokenKey) {
        dispatch(actions.setNeedAuth(true));
        return;
      }
      const params = [topInfo.memoryRelationIndex, 1];
      sendTransaction('addLike', params, { tokenAddress, address }).then(() => {
        getNumTopLikes();
      });

      let { isMyLike, numLike } = topInfo;
      if (isMyLike) {
        numLike -= 1;
      } else {
        numLike += 1;
      }
      isMyLike = !isMyLike;
      const newTopInfo = Object.assign({}, topInfo, { numLike, isMyLike });
      setTopInfo(newTopInfo);
    } catch (error) {
      console.error(error);
      const message = `An error occurred, please try again later`;
      enqueueSnackbar(message, { variant: 'error' });
    }
  }

  function handerFlow() {
    try {
      if (!tokenKey) {
        dispatch(actions.setNeedAuth(true));
        return;
      }
      const params = [topInfo.index];
      sendTransaction('addFlowLock', params, { tokenAddress, address }).then(() => {
        getNumTopFollow();
      });

      let { numFollow, isMyFollow } = topInfo;
      if (isMyFollow) {
        numFollow -= 1;
      } else {
        numFollow += 1;
      }
      isMyFollow = !isMyFollow;
      const newTopInfo = Object.assign({}, topInfo, { numFollow, isMyFollow });
      setTopInfo(newTopInfo);
    } catch (error) {
      console.error(error);
      const message = `An error occurred, please try again later`;
      enqueueSnackbar(message, { variant: 'error' });
    }
  }

  function getNumTopLikes() {
    if (topInfo.memoryRelationIndex === '' || topInfo.memoryRelationIndex == null || topInfo.memoryRelationIndex < 0)
      return;
    callView('getLikeByMemoIndex', [topInfo.memoryRelationIndex]).then(data => {
      const { numLike, isMyLike } = serialLikeData(data);
      if (topInfo.numLike !== numLike || topInfo.isMyLike !== isMyLike) {
        const newTopInfo = Object.assign({}, topInfo, { numLike, isMyLike });
        setTopInfo(newTopInfo);
      }
    });
  }

  function getNumTopFollow() {
    callView('getFollowByLockIndex', [topInfo.index]).then(data => {
      const { numFollow, isMyFollow } = serialFollowData(data);
      if (topInfo.numFollow !== numFollow || topInfo.isMyLike !== isMyFollow) {
        const newTopInfo = Object.assign({}, topInfo, { numFollow, isMyFollow });
        setTopInfo(newTopInfo);
      }
    });
  }
  function serialLikeData(likes) {
    const isMyLike = !!likes[address];
    const num = Object.keys(likes).length;
    return { numLike: num, isMyLike };
  }
  function serialFollowData(follow) {
    const isMyFollow = follow.includes(address);
    const num = follow.length;
    return { numFollow: num, isMyFollow };
  }
  const classes = useStyles();
  const [isOpenCrop, setIsOpenCrop] = useState(false);
  const [originFile, setOriginFile] = useState([]);
  const [cropFile, setCropFile] = useState('');
  const [cropImg, setCropImg] = useState('');

  function handleImageChange(event) {
    event.preventDefault();
    const orFiles = Array.from(event.target.files);
    if (orFiles.length > 0) {
      setOriginFile(orFiles);
      setIsOpenCrop(true);
    } else {
      setIsOpenCrop(false);
    }
  }

  function closeCrop() {
    setIsOpenCrop(false);
  }

  function acceptCrop(e) {
    closeCrop();
    setCropFile(e.cropFile);
    setCropImg(e.avaPreview);
  }

  function cancelCoverImg() {
    setCropFile('');
    setCropImg('');
  }

  function acceptCoverImg() {
    if (!tokenKey) {
      setNeedAuth(true);
      return;
    }
    setGLoading(true);
    setTimeout(async () => {
      if (cropFile) {
        const hash = await saveFileToIpfs(cropFile);
        const method = 'changeCoverImg';
        const params = [proIndex, hash];
        const result = await sendTransaction(method, params, { address, tokenAddress });
        if (result) {
          setCropFile('');
          setCropImg('');
          const newTopInfo = Object.assign({}, topInfo, { coverImg: hash });
          setTopInfo(newTopInfo);
          // topInfo.coverImg = hash
          // setTopInfo(topInfo)
          // callView('getProposeByIndex', [proIndex]).then(propose => {
          //   const pro = (propose && propose[0]) || {};
          //   setTopInfo(Object.assign({}, topInfo, pro));
          // });
        }
      }
      setGLoading(false);
    }, 1);
  }

  const buttonChange = (
    <Button className={classes.icon}>
      <PhotoCameraIcon className={classes.photoCameraIcon} />
      <input
        accept="image/jpeg,image/png"
        className="fileInput"
        role="button"
        type="file"
        value=""
        onChange={handleImageChange}
      />
      <Typography className={classes.changeCoverTitle} noWrap>
        Change
      </Typography>
    </Button>
  );

  if (loading) {
    return (
      <TopContainerBox>
        <div className="top__coverimg">
          <Skeleton variant="rect" width="100%" height={425} />
        </div>
        <WarrperChatBox>
          <FlexWidthBox width="50%" className="proposeMes">
            <CardHeader
              className={classes.card}
              avatar={<Skeleton variant="circle" width={40} height={40} />}
              title={<Skeleton height={6} width="80%" />}
              subheader={<Skeleton height={12} width="80%" />}
            />
          </FlexWidthBox>
          <FlexWidthBox width="50%" className="proposeMes">
            <CardHeader
              className={classes.card}
              avatar={<Skeleton variant="circle" width={40} height={40} />}
              title={<Skeleton height={6} width="80%" />}
              subheader={<Skeleton height={12} width="80%" />}
            />
          </FlexWidthBox>
        </WarrperChatBox>
      </TopContainerBox>
    );
  }

  return (
    <TopContainerBox>
      <div className="top__coverimg">
        {cropFile ? (
          <CardMedia className={classes.media} image={cropImg} title="Change lock image">
            <div className="showChangeImg">
              <div>{buttonChange}</div>
              <Button variant="contained" color="primary" className={classes.button} onClick={cancelCoverImg}>
                Cancel
              </Button>
              <Button variant="contained" color="primary" className={classes.button} onClick={acceptCoverImg}>
                OK
              </Button>
            </div>
          </CardMedia>
        ) : (
          <CardMedia
            className={classes.media}
            image={process.env.REACT_APP_IPFS + topInfo.coverImg}
            title="Change lock image"
          >
            <div className="showChangeImg">{buttonChange}</div>
          </CardMedia>
        )}
      </div>
      <SummaryCard>
        <div className="dayago">
          {topInfo.type !== 2 && <img src="/static/img/happy-copy.svg" alt="together" />}
          <div className="summaryDay">
            {topInfo.type === 2 ? (
              'JOURNAL'
            ) : (
              <span>
                {diffDate === 0 && 'First day'}
                {diffDate > 0 && (diffDate === 1 ? `${diffDate} day` : `${diffDate} days`)}
              </span>
            )}
          </div>
          <HolidayEvent day={topInfo.s_date} />
        </div>
        <div className="proLike">
          <Button onClick={handerFlow}>
            {topInfo.isMyFollow ? (
              <React.Fragment>
                {/* <FavoriteIcon color="primary" className={classes.rightIcon} /> */}
                <Typography component="span" variant="body2" color="primary" className={classes.rightIcon}>
                  I care
                </Typography>
                <Typography component="span" variant="body2" color="primary">
                  {topInfo.numFollow > 0 && `${topInfo.numFollow}`}
                </Typography>
              </React.Fragment>
            ) : (
              <React.Fragment>
                {/* <FavoriteBorderIcon className={classes.rightIcon} /> */}
                <Typography component="span" variant="body2">
                  I care {topInfo.numFollow > 0 && `${topInfo.numFollow}`}
                </Typography>
              </React.Fragment>
            )}
          </Button>
          <Button onClick={handerLike}>
            {topInfo.isMyLike ? (
              <React.Fragment>
                <FavoriteIcon color="primary" className={classes.rightIcon} />
                <Typography component="span" variant="body2" color="primary">
                  {topInfo.numLike > 0 && `${topInfo.numLike}`}
                </Typography>
              </React.Fragment>
            ) : (
              <React.Fragment>
                <FavoriteBorderIcon className={classes.rightIcon} />
                <Typography component="span" variant="body2">
                  {topInfo.numLike > 0 && `${topInfo.numLike}`}
                </Typography>
              </React.Fragment>
            )}
          </Button>
        </div>
      </SummaryCard>
      <WarrperChatBox>
        {topInfo.s_content && (
          <FlexWidthBox width="50%" className="proposeMes">
            <div className="user_photo fl">
              <AvatarPro alt="img" hash={topInfo.s_avatar} className={classes.avatar} />
            </div>
            <div className="content_detail fl clearfix">
              <div className="name_time">
                <span className="user_name color-violet">{topInfo.s_name}</span>
                <span className="sinceDate">・</span>
                <span className="time color-gray">
                  <TimeWithFormat value={topInfo.s_date} format="DD MMM YYYY" />
                </span>
              </div>
              <p>{topInfo.s_content}</p>
            </div>
          </FlexWidthBox>
        )}
        {topInfo.r_content && (
          <FlexWidthBox width="50%" className="proposeMes">
            <div className="content_detail fl clearfix">
              <div className="name_time fr">
                <span className="user_name color-violet">{topInfo.r_name}</span>
              </div>
              <div className="contentPage">
                <p className="rightContent">{topInfo.r_content}</p>
              </div>
            </div>
            <div className="user_photo fr">
              <AvatarPro alt="img" hash={topInfo.r_avatar} className={classes.avatar} />
            </div>
          </FlexWidthBox>
        )}
      </WarrperChatBox>
      {isOpenCrop && <ImageCrop close={closeCrop} accept={acceptCrop} originFile={originFile} isViewSquare />}
    </TopContainerBox>
  );
}
const mapStateToProps = state => {
  return {
    topInfo: state.loveinfo.topInfo,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    setTopInfo: value => {
      dispatch(actions.setTopInfo(value));
    },
    setMemory: value => {
      dispatch(actions.setMemory(value));
    },
    setNeedAuth(value) {
      dispatch(actions.setNeedAuth(value));
    },
    setGLoading(value) {
      dispatch(actions.setLoading(value));
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TopContrainer);
