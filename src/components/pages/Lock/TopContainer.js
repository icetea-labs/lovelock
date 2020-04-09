import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { makeStyles } from '@material-ui/core/styles';
// import CardHeader from '@material-ui/core/CardHeader';
import Skeleton from '@material-ui/lab/Skeleton';
import { CardMedia, Button, Typography } from '@material-ui/core';
import PhotoCameraIcon from '@material-ui/icons/PhotoCamera';
import FavoriteIcon from '@material-ui/icons/Favorite';
import FavoriteBorderIcon from '@material-ui/icons/FavoriteBorder';
import BookmarkIcon from '@material-ui/icons/Bookmark';
import BookmarkBorderIcon from '@material-ui/icons/BookmarkBorder';
import { useSnackbar } from 'notistack';
import Link from '@material-ui/core/Link';
import { FormattedMessage } from 'react-intl';

import IconButton from '@material-ui/core/IconButton';
import ReadMore from '../../elements/ReaMore';

import {
  callView,
  summaryDayCal,
  HolidayEvent,
  TimeWithFormat,
  saveFileToIpfs,
  applyRotation,
  imageResize,
  handleError,
} from '../../../helper';
import { useTx } from '../../../helper/hooks';
import * as actions from '../../../store/actions';
import { FlexBox, rem } from '../../elements/StyledUtils';
import { ArrowTooltip, AvatarPro } from '../../elements';
import ImageCrop from '../../elements/ImageCrop';
import EditLockModal from '../../elements/EditLockModal';

const TopContainerBox = styled.div`
  .top__coverimg {
    position: relative;
    overflow: hidden;
    max-width: ${rem(900)};
    /* max-height: ${rem(425)};
    min-height: ${rem(225)}; */
    .showChangeImg {
      position: absolute;
      top: 5px;
      left: 5px;
      & > div {
        display: none;
      }
      & > button {
        display: inline-flex;
      }
    }
    &:hover {
      .showChangeImg {
        & > div {
          display: block;
        }
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
  margin-top: ${props => (props && props.isJournal ? '-4px' : rem(15))};
  div:nth-child(even) .content_detail p {
    background-image: -webkit-linear-gradient(128deg, #ad76ff, #8dc1fe);
    background-image: linear-gradient(322deg, #ad76ff, #8dc1fe);
  }
  .proposeMes {
    display: flex;
    width: 50%;
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
    position: relative;
    .user_name {
      font-weight: 600;
      text-transform: capitalize;
      color: #8250c8;
      max-width: 34vw;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      display: inline-block;
    }
    .time {
      font-size: ${rem(12)};
      color: #8f8f8f;
    }
    .edit_icon {
      margin-left: 5px;
      position: absolute;
      top: -5px;
      &--right {
        margin-left: -30px;
      }
      i {
        font-size: 14px;
        position: absolute;
        color: mediumpurple;
      }
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
    content: '';
  }
  .rightContent {
    text-align: right;
    background-image: linear-gradient(337deg, #ad76ff, #8dc1fe);
    display: block;
    padding: ${rem(11)} ${rem(14)};
    font-size: ${rem(12)};
    line-height: ${rem(18)};
    color: #ffffff;
    border-radius: 10px;
    margin-top: 10px;
    box-shadow: 0 6px 12px 0 rgba(0, 0, 0, 0.1);
  }
  .lockView {
    display: block;
    padding: ${rem(11)} ${rem(14)};
    font-size: ${rem(12)};
    line-height: ${rem(18)};
    color: #ffffff;
    border-radius: 10px;
    margin-top: 10px;
    box-shadow: 0 6px 12px 0 rgba(0, 0, 0, 0.1);
    background-image: linear-gradient(337deg, #76a8ff, #8df6fe);
  }
  @media (max-width: 768px) {
    display: block;
    .proposeMes {
      width: 100%;
      margin-bottom: 20px;
    }
    .name_time {
      color: red;
    }
  }
`;

const SummaryCard = styled.div`
  display: flex;
  justify-content: space-between;
  .journalTitle {
    display: inline-block;
    background-color: rgba(0, 0, 0, 0.3);
    color: #f5f5f5;
    position: relative;
    top: -32px;
    padding: 0 16px;
    font-size: 20px;
    font-weight: 600;
    line-height: 32px;
    height: 32px;
  }
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
  }
  .proLike {
    display: flex;
    height: 50px;
    padding: 8px 0;
    box-sizing: border-box;
  }
`;

const SummaryCongrat = styled.div`
  text-align: center;
  align-items: center;
  margin-top: -40px;
  height: 36px;
  font-size: 12px;
  font-weight: 500;
  color: #87198d;
  .congratContent {
    padding: 12px;
  }
  .summaryCongrat {
    display: inline-block;
    border-radius: 18px;
    background-color: #fdf0f6;
    width: 50%;
    @media (max-width: 768px) {
      width: 100%;
    }
  }
  @media (max-width: 768px) {
    margin-top: 0;
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
    // '&:hover': {
    // '& $icon': {
    // display: 'flex',
    // alignItem: 'center',
    // },
    // },
  },
  btChange: {
    margin: theme.spacing(1),
    fontSize: '12px',
    color: 'white',
    backgroundColor: 'rgba(0,0,0,.05)',
    // display: 'none',
  },
  photoCameraIcon: {
    marginRight: theme.spacing(1),
  },
  input: {
    display: 'none',
  },
  button: {
    margin: theme.spacing(1),
    opacity: 0.9,
    '&:hover': {
      // background: 'linear-gradient(332deg, #591ea5, #fe8dc3)',
      opacity: 1,
    },
  },
  changeCoverTitle: {
    marginTop: '4px',
  },
  btLikeFollow: {
    color: theme.palette.text.secondary,
    // color: '#fff',
    // background: '#92b5fe',
    marginLeft: theme.spacing(1),
  },
  textFollow: {
    fontWeight: '600',
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
    margin: theme.spacing(0, 0.3),
    fontWeight: 700,
  },
}));

function TopContrainer(props) {
  const { proIndex, address, topInfo, setTopInfo, setGLoading } = props;
  const tx = useTx();
  const isSender = topInfo.sender === address;
  const isReceiver = topInfo.receiver === address;
  const [loading, setLoading] = useState(true);
  const [isEditLockModalOpened, setIsEditLockModalOpened] = useState(false);
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
      setTopInfo({ ...topInfo, ...likeData, ...followData });
    }
    setLoading(needUpdate);

    if (!needUpdate) {
      setProposeLikeInfo();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [needUpdate]);

  function handleLike() {
    try {
      tx.sendCommit('addLike', topInfo.memoryRelationIndex, 1)
        .then(() => {
          getNumTopLikes();
        })
        .catch(err => {
          getNumTopLikes();
          const msg = handleError(err, 'sendding like lock');
          enqueueSnackbar(msg, { variant: 'error' });
        });

      let { isMyLike, numLike } = topInfo;
      if (isMyLike) {
        numLike -= 1;
      } else {
        numLike += 1;
      }
      isMyLike = !isMyLike;
      const newTopInfo = { ...topInfo, numLike, isMyLike };
      setTopInfo(newTopInfo);
    } catch (err) {
      const msg = handleError(err, 'sendding like lock');
      enqueueSnackbar(msg, { variant: 'error' });
    }
  }

  function handleFollow() {
    try {
      tx.sendCommit('followLock', topInfo.index)
        .then(() => {
          getNumTopFollow();
        })
        .catch(err => {
          getNumTopFollow();
          const msg = handleError(err, 'sendding follow lock');
          enqueueSnackbar(msg, { variant: 'error' });
        });

      let { numFollow, isMyFollow } = topInfo;
      if (isMyFollow) {
        numFollow -= 1;
      } else {
        numFollow += 1;
      }
      isMyFollow = !isMyFollow;
      const newTopInfo = { ...topInfo, numFollow, isMyFollow };
      setTopInfo(newTopInfo);
    } catch (err) {
      const msg = handleError(err, 'sendding follow lock');
      enqueueSnackbar(msg, { variant: 'error' });
    }
  }

  function getNumTopLikes() {
    if (topInfo.memoryRelationIndex === '' || topInfo.memoryRelationIndex == null || topInfo.memoryRelationIndex < 0)
      return;
    callView('getLikeByMemoIndex', [topInfo.memoryRelationIndex]).then(data => {
      const { numLike, isMyLike } = serialLikeData(data);
      // if (topInfo.numLike !== numLike || topInfo.isMyLike !== isMyLike) {
      const newTopInfo = { ...topInfo, numLike, isMyLike };
      setTopInfo(newTopInfo);
      // }
    });
  }

  function getNumTopFollow() {
    callView('getFollowByLockIndex', [topInfo.index]).then(data => {
      const { numFollow, isMyFollow } = serialFollowData(data);
      // if (topInfo.numFollow !== numFollow || topInfo.isMyLike !== isMyFollow) {
      const newTopInfo = { ...topInfo, numFollow, isMyFollow };
      setTopInfo(newTopInfo);
      // }
    });
  }
  function serialLikeData(likes) {
    const isMyLike = !!likes[address];
    const num = Object.keys(likes).length;
    return { numLike: num, isMyLike };
  }
  function serialFollowData(follow) {
    if (!follow) return { numFollow: 0, isMyFollow: false };
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
    setGLoading(true);
    setTimeout(async () => {
      if (cropFile) {
        const newFile = await applyRotation(cropFile[0], 1, 1200);
        const saveFile = imageResize(cropFile[0], newFile);

        // TODO: combine in single operation
        const hash = await saveFileToIpfs(saveFile);
        const result = await tx.sendCommit('changeCoverImg', proIndex, hash);
        if (result) {
          setCropFile('');
          setCropImg('');
          const newTopInfo = { ...topInfo, coverImg: hash };
          setTopInfo(newTopInfo);
        }
      }
      setGLoading(false);
    }, 1);
  }

  const buttonChange = () => (
    <label htmlFor="outlined-button-file">
      <Button component="span" className={classes.btChange}>
        <PhotoCameraIcon className={classes.photoCameraIcon} />
        <Typography noWrap>
          <FormattedMessage id="topContainer.changeCover" />
        </Typography>
        <input
          accept="image/jpeg,image/png"
          className={classes.input}
          id="outlined-button-file"
          type="file"
          value=""
          onChange={handleImageChange}
        />
      </Button>
    </label>
  );

  // if (loading) {
  //   return (
  //     <TopContainerBox>
  //       <div className="top__coverimg">
  //         <Skeleton variant="rect" width="100%" className={classes.media} />
  //       </div>
  //       <WarrperChatBox>
  //         <div className="proposeMes">
  //           <CardHeader
  //             className={classes.card}
  //             avatar={<Skeleton variant="circle" width={58} height={58} />}
  //             title={<Skeleton height={6} width="80%" />}
  //             subheader={<Skeleton height={40} width="80%" />}
  //           />
  //         </div>
  //         <div className="proposeMes">
  //           <CardHeader
  //             className={classes.card}
  //             avatar={<Skeleton variant="circle" width={58} height={58} />}
  //             title={<Skeleton height={6} width="80%" />}
  //             subheader={<Skeleton height={40} width="80%" />}
  //           />
  //         </div>
  //       </WarrperChatBox>
  //     </TopContainerBox>
  //   );
  // }

  const renderEditLockIcon = (isRight = false) => (
    <IconButton
      className={`edit_icon ${isRight ? 'edit_icon--right' : ''}`}
      onClick={() => setIsEditLockModalOpened(true)}
    >
      <i className="material-icons">edit</i>
    </IconButton>
  );

  const canChangeCover = () => {
    if (!address || !topInfo) return false;
    return isSender || isReceiver;
  };

  if (!topInfo || !topInfo.sender) return <div />; // loading...

  return (
    <TopContainerBox>
      <div className="top__coverimg">
        {cropFile ? (
          <CardMedia className={classes.media} image={cropImg}>
            {canChangeCover() && (
              <div className="showChangeImg">
                <Button variant="contained" className={classes.button} onClick={cancelCoverImg}>
                  <FormattedMessage id="topContainer.changeCancel" />
                </Button>
                <Button variant="contained" color="primary" className={classes.button} onClick={acceptCoverImg}>
                  <FormattedMessage id="topContainer.changeApply" />
                </Button>
              </div>
            )}
          </CardMedia>
        ) : (
          <CardMedia
            className={classes.media}
            image={topInfo.coverImg && process.env.REACT_APP_IPFS + topInfo.coverImg}
          >
            {canChangeCover() && (
              <div className="showChangeImg">
                <div>{buttonChange()}</div>
              </div>
            )}
          </CardMedia>
        )}
      </div>
      <SummaryCard>
        {!topInfo.isJournal ? (
          <div className="dayago">
            <img src="/static/img/happy-copy.svg" alt="together" />
            <div className="summaryDay">
              <span>
                {diffDate === 0 && 'First day'}
                {diffDate > 0 && (diffDate === 1 ? `${diffDate} day` : `${diffDate} days`)}
              </span>
            </div>
          </div>
        ) : (
          <div className="journalTitle">
            <FormattedMessage id="topContainer.journal" />
          </div>
        )}
        <div className="proLike">
          <ArrowTooltip title="Follow">
            <Button onClick={handleFollow} className={classes.btLikeFollow}>
              {topInfo.isMyFollow ? (
                <>
                  <BookmarkIcon color="primary" className={classes.rightIcon} />
                  <Typography component="span" variant="body2" color="primary" className={classes.textFollow}>
                    <FormattedMessage id="topContainer.following" />
                    {/* {topInfo.numFollow > 0 && `${topInfo.numFollow}`} */}
                  </Typography>
                </>
              ) : (
                <>
                  <BookmarkBorderIcon className={classes.rightIcon} />
                  <Typography component="span" variant="body2" className={classes.textFollow}>
                    <FormattedMessage id="topContainer.follow" />
                    {/* {topInfo.numFollow > 0 && `${topInfo.numFollow}`} */}
                  </Typography>
                </>
              )}
            </Button>
          </ArrowTooltip>
          <ArrowTooltip title="Express feelings">
            <Button onClick={handleLike} className={classes.btLikeFollow}>
              {topInfo.isMyLike ? (
                <>
                  <FavoriteIcon color="primary" className={classes.rightIcon} />
                  <Typography component="span" variant="body2" color="primary">
                    {topInfo.numLike ? `${topInfo.numLike}` : ''}
                  </Typography>
                </>
              ) : (
                <>
                  <FavoriteBorderIcon className={classes.rightIcon} />
                  <Typography component="span" variant="body2">
                    {topInfo.numLike ? `${topInfo.numLike}` : ''}
                  </Typography>
                </>
              )}
            </Button>
          </ArrowTooltip>
        </div>
      </SummaryCard>
      {/* isJournal={topInfo.isJournal} */}
      {!topInfo.isJournal && (
        <SummaryCongrat>
          <HolidayEvent day={topInfo.s_date} />
        </SummaryCongrat>
      )}
      <WarrperChatBox>
        <div className="proposeMes">
          <div className="user_photo fl">
            {loading ? (
              <Skeleton className={classes.avatar} />
            ) : (
              <AvatarPro alt="img" hash={topInfo.s_avatar} className={classes.avatar} />
            )}
          </div>
          <div className="content_detail fl clearfix">
            {loading ? (
              <Skeleton height={12} width="60%" />
            ) : (
              <div className="name_time">
                {/* <span className="user_name color-violet">{topInfo.s_name}</span> */}
                <Link
                  href={`/u/${topInfo.sender}`}
                  className="user_name color-violet"
                  title={topInfo.s_info.lockName || ''}
                >
                  {`${topInfo.s_info.lockName || topInfo.s_name}`}
                </Link>
                <span className="sinceDate">・</span>
                <span className="time color-gray">
                  <TimeWithFormat value={topInfo.s_date} format="DD MMM YYYY" />
                </span>
                {isSender && renderEditLockIcon()}
              </div>
            )}
            {loading ? (
              <Skeleton height={40} width="100%" />
            ) : topInfo.s_content.length > 150 ? (
              <div className="lockView">
                <ReadMore
                  text={topInfo.s_content}
                  numberOfLines={4}
                  lineHeight={1.6}
                  showLessButton
                  readMoreCharacterLimit={150}
                />
              </div>
            ) : (
              <div className="lockView">{topInfo.s_content || ''}</div>
            )}
          </div>
        </div>

        {topInfo.r_content && (
          <div className="proposeMes">
            <div className="content_detail clearfix">
              {loading ? (
                <Skeleton height={12} width="60%" />
              ) : (
                <div className="name_time" style={{ width: '100%', textAlign: 'right' }}>
                  {isReceiver && renderEditLockIcon(true)}
                  <Link href={`/u/${topInfo.receiver}`} className="user_name color-violet">{`${topInfo.r_name}`}</Link>
                </div>
              )}
              {loading ? (
                <Skeleton height={40} width="100%" />
              ) : topInfo.r_content.length > 150 ? (
                <div className="rightContent">
                  <ReadMore
                    text={topInfo.r_content}
                    numberOfLines={4}
                    lineHeight={1.6}
                    showLessButton
                    readMoreCharacterLimit={150}
                  />
                </div>
              ) : (
                <div className="rightContent">{topInfo.r_content}</div>
              )}
            </div>
            <div className="user_photo ">
              {loading ? (
                <Skeleton className={classes.avatar} />
              ) : (
                <AvatarPro alt="img" hash={topInfo.r_avatar} className={classes.avatar} />
              )}
            </div>
          </div>
        )}
      </WarrperChatBox>
      {isOpenCrop && <ImageCrop close={closeCrop} accept={acceptCrop} originFile={originFile} isViewSquare />}
      {isEditLockModalOpened && (
        <EditLockModal
          close={() => setIsEditLockModalOpened(false)}
          topInfo={topInfo}
          isSender={isSender}
          isReceiver={isReceiver}
        />
      )}
    </TopContainerBox>
  );
}
const mapStateToProps = state => {
  return {
    topInfo: state.loveinfo.topInfo,
    address: state.account.address,
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
    setGLoading(value) {
      dispatch(actions.setLoading(value));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(TopContrainer);
