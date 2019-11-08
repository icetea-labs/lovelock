import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useSelector, useDispatch, connect } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import CardHeader from '@material-ui/core/CardHeader';
import Skeleton from '@material-ui/lab/Skeleton';
import { CardMedia, Button, Typography } from '@material-ui/core';
import PhotoCameraIcon from '@material-ui/icons/PhotoCamera';
import BookmarkIcon from '@material-ui/icons/Bookmark';
import BookmarkBorderIcon from '@material-ui/icons/BookmarkBorder';

import * as actions from '../../../store/actions';
import { FlexBox, rem } from '../../elements/StyledUtils';
import { ArrowTooltip, AvatarPro } from '../../elements';

const TopContainerBox = styled.div`
  .top__coverimg {
    position: relative;
    /* overflow: hidden; */
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
  .feedAvata {
    position:absolute;
    bottom: -25px;
    left: 15px;
  }
  .feedName {
    position:absolute;
    bottom: 12px;
    left: 201px;
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
const SummaryCard = styled.div`
  display: flex;
  justify-content: space-between;
  .dayago {
    display: flex;
    align-items: flex-end;
    img {
      /* width: 50px; */
      /* height: 50px; */
      /* object-fit: contain; */
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
    width: 168,
    height: 168,
    border: ['4px', 'solid', '#FFF'].join(' '),
  },
  media: {
    height: 0,
    paddingTop: '42.85%', // 21:9
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
  feedName: {
    color: '#fff',
    // fontSize: 25,
  },
}));
const topInfo = {};
function TopFeed(props) {
  const classes = useStyles();
  const [isOpenCrop, setIsOpenCrop] = useState(false);
  const [cropFile, setCropFile] = useState('');
  const [cropImg, setCropImg] = useState('');

  function handleImageChange(event) {
    event.preventDefault();
    const orFiles = Array.from(event.target.files);
    if (orFiles.length > 0) {
      // setOriginFile(orFiles);
      setIsOpenCrop(true);
    } else {
      setIsOpenCrop(false);
    }
  }

  function handerFlow() {}

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

  return (
    <TopContainerBox>
      <div className="top__coverimg">
        {cropFile ? (
          <CardMedia className={classes.media} image={cropImg} title="Change lock image">
            <div className="showChangeImg">
              <div>{buttonChange}</div>
              {/* <Button variant="contained" color="primary" className={classes.button} onClick={cancelCoverImg}>
                Cancel
              </Button>
              <Button variant="contained" color="primary" className={classes.button} onClick={acceptCoverImg}>
                OK
              </Button> */}
            </div>
          </CardMedia>
        ) : (
          <CardMedia
            className={classes.media}
            image={`${process.env.REACT_APP_IPFS}QmXtwtitd7ouUKJfmfXXcmsUhq2nGv98nxnw2reYg4yncM`}
            title="Change lock image"
          >
            <div className="showChangeImg">{buttonChange}</div>
          </CardMedia>
        )}
        <div className="feedAvata">
          <AvatarPro alt="img" hash="QmXtwtitd7ouUKJfmfXXcmsUhq2nGv98nxnw2reYg4yncM" className={classes.avatar} />
        </div>
        <div className="feedName">
          <Typography component="span" variant="h5" color="primary" className={classes.feedName}>
            Hoang Quoc Huy
          </Typography>
        </div>
      </div>
      <SummaryCard>
        <div className="dayago"></div>
        <div className="proLike">
          <ArrowTooltip title="I Care">
            <Button onClick={handerFlow}>
              {topInfo.isMyFollow ? (
                <React.Fragment>
                  <BookmarkIcon color="primary" className={classes.rightIcon} />
                  <Typography component="span" variant="body2" color="primary">
                    {topInfo.numFollow > 0 && `${topInfo.numFollow}`}
                  </Typography>
                </React.Fragment>
              ) : (
                <React.Fragment>
                  <BookmarkBorderIcon className={classes.rightIcon} />
                  <Typography component="span" variant="body2">
                    {topInfo.numFollow > 0 && `${topInfo.numFollow}`}
                  </Typography>
                </React.Fragment>
              )}
            </Button>
          </ArrowTooltip>
        </div>
      </SummaryCard>
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
)(TopFeed);
