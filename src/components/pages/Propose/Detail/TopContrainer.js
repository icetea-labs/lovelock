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

import tweb3 from '../../../../service/tweb3';

import {
  callView,
  getTagsInfo,
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
    max-height: ${rem(425)};
    min-height: ${rem(225)};
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
  margin-top: 15px;
  .dayago {
    align-items: center;
    display: flex;
    img {
      width: 50px;
      height: 50px;
      margin-bottom: 12px;
      object-fit: contain;
    }
    .summaryDay {
      margin: 7px;
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
    height: 450,
    cursor: 'pointer',
    position: 'relative',
    overflow: 'hidden',
    backgroundSize: 'cover',
    '&:hover': {
      '& $icon': {
        display: 'flex',
        alignItem: 'center',
      },
    },
  },
  icon: {
    margin: theme.spacing(1),
    fontSize: '12px',
    color: 'white',
    display: 'none',
  },
  photoCameraIcon: {
    marginRight: theme.spacing(1),
    marginTop: theme.spacing(0.5),
  },
  button: {
    margin: theme.spacing(1),
    background: 'rgba(254,141,195,0.5)',
    '&:hover': {
      background: 'linear-gradient(332deg, #591ea5, #fe8dc3)',
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
    marginRight: theme.spacing(1),
  },
}));

function TopContrainer(props) {
  const { proIndex, setNeedAuth, setGLoading } = props;
  const dispatch = useDispatch();
  const propose = useSelector(state => state.loveinfo.propose);
  // const privateKey = useSelector(state => state.account.privateKey);
  const tokenAddress = useSelector(state => state.account.tokenAddress);
  const tokenKey = useSelector(state => state.account.tokenKey);
  const address = useSelector(state => state.account.address);

  const [topInfo, setTopInfo] = useState({});
  const [loading, setLoading] = useState(true);
  const [isMyLike, setIsMyLike] = useState(false);
  const [numLike, setNumLike] = useState(0);
  const [memoryRelationIndex, setMemoryRelationIndex] = useState(-1);
  const { enqueueSnackbar } = useSnackbar();
  const diffDate = summaryDayCal(topInfo.s_date);

  useEffect(() => {
    loadProposes();
  }, [proIndex]);

  useEffect(() => {
    if (memoryRelationIndex !== -1) getNumLikes();
    const returnValue = watchAddlike();
    return () => {
      Promise.resolve(returnValue).then(({ unsubscribe }) => unsubscribe && unsubscribe());
    };
  }, [memoryRelationIndex]);

  function watchAddlike() {
    const filter = {};
    return tweb3.contract(process.env.REACT_APP_CONTRACT).events.addLike(filter, async error => {
      if (error) {
        const message = 'Watch addlike error';
        enqueueSnackbar(message, { variant: 'error' });
      } else {
        getNumLikes();
      }
    });
  }

  function loadProposes() {
    window.scrollTo(0, 0);
    setLoading(true);
    setTimeout(async () => {
      try {
        let proInfo = propose.filter(item => item.id === proIndex)[0] || [];
        if (typeof proInfo === 'undefined' || proInfo.length <= 0) {
          const resp = (await callView('getProposeByIndex', [proIndex])) || [];
          proInfo = resp[0] || [];
        }
        const moreProInfo = await addInfoToProposes(proInfo);
        // console.log('moreProInfo', moreProInfo);
        setTopInfo(moreProInfo);
        props.getTopInfo(moreProInfo);
        setMemoryRelationIndex(proInfo.memoryRelationIndex);
      } catch (e) {
        console.log('loadProposes', e);
      }
      setLoading(false);
    }, 10);
  }

  async function getNumLikes() {
    if (!memoryRelationIndex || memoryRelationIndex === -1) return;
    // console.log('getNumLikes', memoryRelationIndex);
    const data = await callView('getLikeByMemoIndex', [memoryRelationIndex]);
    const num = Object.keys(data).length;
    if (data[address]) {
      setIsMyLike(true);
    } else {
      setIsMyLike(false);
    }
    setNumLike(num);
  }
  async function handerLike() {
    if (!tokenKey) {
      dispatch(actions.setNeedAuth(true));
      return;
    }
    const method = 'addLike';
    const params = [topInfo.memoryRelationIndex, 1];
    const result = await sendTransaction(method, params, { address, tokenAddress });
    if (result) {
      getNumLikes();
    }
  }

  async function addInfoToProposes(respPro) {
    const proposes = respPro;
    const { sender, receiver } = proposes;

    const senderTags = await getTagsInfo(sender);
    proposes.s_name = senderTags['display-name'];
    proposes.s_publicKey = senderTags['pub-key'] || '';
    proposes.s_avatar = senderTags.avatar;

    const botInfo = proposes.bot_info;
    // console.log('botInfo', botInfo);

    if (receiver === process.env.REACT_APP_BOT_LOVER) {
      proposes.r_name = `${botInfo.firstname} ${botInfo.lastname}`;
      proposes.r_publicKey = senderTags['pub-key'] || '';
      proposes.r_avatar = botInfo.botAva;
      proposes.r_content = botInfo.botReply;
    } else {
      const receiverTags = await getTagsInfo(receiver);
      proposes.r_name = receiverTags['display-name'];
      proposes.r_publicKey = receiverTags['pub-key'] || '';
      proposes.r_avatar = receiverTags.avatar;
      proposes.r_content = proposes.r_content;
    }
    proposes.publicKey = sender === address ? proposes.r_publicKey : proposes.s_publicKey;

    const info = proposes.s_info;

    proposes.coverimg = proposes.coverImg ? proposes.coverImg : 'QmdQ61HJbJcTP86W4Lo9DQwmCUSETm3669TCMK42o8Fw4f';
    proposes.s_date = info.date;
    proposes.r_date = info.date;

    const accountInfo = {
      s_publicKey: proposes.s_publicKey,
      s_address: proposes.sender,
      r_publicKey: proposes.r_publicKey,
      r_address: proposes.receiver,
      publicKey: proposes.publicKey,
    };
    dispatch(actions.setAccount(accountInfo));
    return proposes;
  }

  const classes = useStyles();
  const [isOpenCrop, setIsOpenCrop] = useState(false);
  const [originFile, setOriginFile] = useState([]);
  const [cropFile, setCropFile] = useState('');
  const [cropImg, setCropImg] = useState('');

  function handleImageChange(event) {
    event.preventDefault();
    const orFiles = event.target.files;

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
          setGLoading(false);
          setCropFile('');
          setCropImg('');
          const resp = (await callView('getProposeByIndex', [proIndex])) || [];
          const newPropose = await addInfoToProposes(resp[0]);
          setTopInfo(newPropose || []);
        }
      }
    }, 100);
  }

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
          <CardMedia className={classes.media} image={cropImg} title="lock image">
            <Button className={classes.icon}>
              <PhotoCameraIcon className={classes.photoCameraIcon} />
              <input className="fileInput" type="file" accept="image/*" onChange={handleImageChange} />
              <Typography className={classes.changeCoverTitle} noWrap>
                Change
              </Typography>
            </Button>
            <Button variant="contained" color="primary" className={classes.button} onClick={cancelCoverImg}>
              Cancel
            </Button>
            <Button variant="contained" color="primary" className={classes.button} onClick={acceptCoverImg}>
              OK
            </Button>
          </CardMedia>
        ) : (
          <CardMedia className={classes.media} image={process.env.REACT_APP_IPFS + topInfo.coverimg} title="lock image">
            <Button className={classes.icon}>
              <PhotoCameraIcon className={classes.photoCameraIcon} />
              <input className="fileInput" type="file" accept="image/*" onChange={handleImageChange} />
              <Typography className={classes.changeCoverTitle} noWrap>
                Change
              </Typography>
            </Button>
          </CardMedia>
        )}
      </div>
      <SummaryCard>
        <div className="dayago">
          {topInfo.type !== 1 && <img src="/static/img/happy-copy.svg" alt="together" />}
          <div className="summaryDay">
            {topInfo.type === 1 ? 'JOURNAL' : <span>{diffDate === 0 ? 'First day' : `${diffDate} days`}</span>}
          </div>
          {/* <div className="summaryCongrat">
            <div className="congratContent"> */}
          <HolidayEvent day={topInfo.s_date} />
          {/* </div>
          </div> */}
        </div>
        <div className="proLike">
          <Button onClick={handerLike}>
            {isMyLike ? (
              <React.Fragment>
                <FavoriteIcon color="primary" className={classes.rightIcon} />
                <Typography component="span" variant="body2" color="primary">
                  {numLike > 0 && `${numLike}`}
                </Typography>
              </React.Fragment>
            ) : (
              <React.Fragment>
                <FavoriteBorderIcon className={classes.rightIcon} />
                <Typography component="span" variant="body2">
                  {numLike > 0 && `${numLike}`}
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
      {isOpenCrop && <ImageCrop close={closeCrop} accept={acceptCrop} originFile={originFile} isCoverImg />}
    </TopContainerBox>
  );
}
const mapStateToProps = state => {
  return {
    memoryList: state.loveinfo.memory,
  };
};

const mapDispatchToProps = dispatch => {
  return {
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
