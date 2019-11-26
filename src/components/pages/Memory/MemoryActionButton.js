import React, { useState, useEffect } from 'react';
import { useSelector, connect } from 'react-redux';
import { CardActions, Button, Typography } from '@material-ui/core';
import CommentIcon from '@material-ui/icons/Comment';
import FavoriteIcon from '@material-ui/icons/Favorite';
import FavoriteBorderIcon from '@material-ui/icons/FavoriteBorder';
import { withStyles, makeStyles } from '@material-ui/core/styles';

import * as actions from '../../../store/actions';
import { useTx } from '../../../helper/hooks';

const useStyles = makeStyles(theme => ({
  button: {
    color: 'rgba(0, 0, 0, 0.54)',
    // minWidth: theme.spacing(12),
    width: '100%',
  },
  rightIcon: {
    marginRight: theme.spacing(1),
  },
  liked: {
    marginRight: theme.spacing(1),
  },
  margin: {
    margin: theme.spacing(1),
  },
  card: {
    // maxWidth: 345,
    marginBottom: theme.spacing(3),
    boxShadow: '0 1px 1px 0 rgba(0, 0, 0, 0.15)',
    // boxShadow: 'none',
    // border: '1px solid rgba(234, 236, 239, 0.7)',
  },
  media: {
    height: 350,
    position: 'relative',
    overflow: 'hidden',
    // maxHeight: 350,
    // minHeight: 150,
  },
  progress: {
    margin: theme.spacing(1),
  },
  acctionsBt: {
    justifyContent: 'space-between',
  },
}));
const StyledCardActions = withStyles(theme => ({
  root: {
    padding: theme.spacing(0.4, 2),
    borderTop: '1px solid #e1e1e1',
  },
}))(CardActions);

function MemoryActionButton(props) {
  const {
    memoryType,
    memoryLikes,
    memoryIndex,
    isDetailScreen,
    handerShowComment,
    numComment,
    setLikeTopInfo,
    numLike, // Lock-level number of likes
    isMyLike, // Lock-level isMyLike
  } = props;

  const isAuto = memoryType === 1 && isDetailScreen;

  const address = useSelector(state => state.account.address);
  const tx = useTx();

  const [memoryNumLike, setMemoryNumLike] = useState(0);
  const [memoryIsMyLike, setMemoryIsMyLike] = useState(false);

  const realLikeData = isAuto
    ? {
        numLike,
        isMyLike,
      }
    : {
        numLike: memoryNumLike,
        isMyLike: memoryIsMyLike,
      };

  const setLikeData = (numLike, isMyLike) => {
    if (isAuto) {
      // dispatch to global state to sync with lock-level like data
      setLikeTopInfo({ numLike, isMyLike });
    } else {
      setMemoryNumLike(numLike);
      setMemoryIsMyLike(isMyLike);
    }
  };

  useEffect(() => {
    if (isAuto) {
      return;
    }

    const num = Object.keys(memoryLikes).length;
    setMemoryIsMyLike(!!memoryLikes[address]);
    setMemoryNumLike(num);
  }, [memoryType, memoryLikes, address, isAuto]);

  async function handleLike() {
    const LOVE = 1; // like, love, wow, etc.
    tx.sendCommit('addLike', memoryIndex, LOVE).then(({ returnValue: likes }) => {
      const newNumLike = Object.keys(likes).length;
      const newIsMyLike = !!likes[address];
      setLikeData(newNumLike, newIsMyLike);
    });
  }

  const classes = useStyles();
  return (
    <StyledCardActions className={classes.acctionsBt}>
      <Button className={classes.button} onClick={handleLike}>
        {realLikeData.isMyLike ? (
          <>
            <FavoriteIcon fontSize="small" color="primary" className={classes.rightIcon} />
            <Typography component="span" variant="body2" color="primary">
              {realLikeData.numLike ? ` ${realLikeData.numLike}` : ''}
            </Typography>
          </>
        ) : (
          <>
            <FavoriteBorderIcon fontSize="small" className={classes.rightIcon} />
            <Typography component="span" variant="body2">
              {realLikeData.numLike ? ` ${realLikeData.numLike}` : ''}
            </Typography>
          </>
        )}
      </Button>

      <Button className={classes.button} onClick={handerShowComment}>
        <CommentIcon fontSize="small" className={classes.rightIcon} />
        <Typography component="span" variant="body2">
          {numComment}
        </Typography>
        {/* {numComment > 0 && (numComment === 1 ? `${numComment} Comment` : `${numComment} Comments`)}
        {numComment === 0 && '0 Comment'} */}
      </Button>
      {/* <Button className={classes.button}>
        <ShareIcon fontSize="small" className={classes.rightIcon} />
        Share
      </Button> */}
    </StyledCardActions>
  );
}

const mapStateToProps = state => {
  return {
    numLike: state.loveinfo.topInfo.numLike,
    isMyLike: state.loveinfo.topInfo.isMyLike,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    setLikeTopInfo: value => {
      dispatch(actions.setLikeTopInfo(value));
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MemoryActionButton);
