import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch, connect } from 'react-redux';
import { CardActions, Button, Typography } from '@material-ui/core';
import CommentIcon from '@material-ui/icons/Comment';
import FavoriteIcon from '@material-ui/icons/Favorite';
import FavoriteBorderIcon from '@material-ui/icons/FavoriteBorder';
import { withStyles, makeStyles } from '@material-ui/core/styles';
import { useSnackbar } from 'notistack';

import * as actions from '../../../store/actions';
import { sendTransaction, callView } from '../../../helper';
import tweb3 from '../../../service/tweb3';

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
  const { memoryType, memoryIndex, handerShowComment, numComment, setLikeTopInfo, setNeedAuth } = props;
  const address = useSelector(state => state.account.address);
  const tokenAddress = useSelector(state => state.account.tokenAddress);
  const tokenKey = useSelector(state => state.account.tokenKey);

  const [likes, setLikes] = useState(props.memoryLikes);
  const [numLike, setNumLike] = useState(0);
  const [isMyLike, setIsMyLike] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const [needUpdateLike, setNeedUpdateLike] = useState(false)
  const mounted = useRef(false)

  useEffect(() => {
    serialLikeData();
  }, [likes]);

  useEffect(() => {
    let cancel = false

    if (!mounted.current) {
      mounted.current = true
    } else {
      callView('getLikeByMemoIndex', [memoryIndex]).then(data => {
        !cancel && mounted.current && setLikes(data);
      });
    }

    return () => {
      cancel = true
    }
  }, [needUpdateLike])

  useEffect(() => {
    let returnValue;
    if (memoryType === 1) returnValue = watchAddlike();

    return () => {
      if (memoryType === 1)
        Promise.resolve(returnValue).then(result => {
          if (result && result.result) result.unsubscribe();
        });
    };
  }, []);

  const refrestLikeCount = () => {
    mounted.current && setNeedUpdateLike(c => !c)
  }

  function watchAddlike() {
    const filter = {};
    return tweb3.contract(process.env.REACT_APP_CONTRACT).events[`addLike_${memoryIndex}`](filter, async (error, result) => {
      if (error) {
        console.error('watchlike', error);
        const message = 'Watch like error';
        enqueueSnackbar(message, { variant: 'error' });
      } else {
        // console.log('watchAddlike', result);
        refrestLikeCount();
      }
    });
  }

  function serialLikeData() {
    const num = Object.keys(likes).length;
    setIsMyLike(!!likes[address]);
    setNumLike(num);
    if (memoryType === 1) setLikeTopInfo({ numLike: num, isMyLike: !!likes[address] });
  }

  function handleLike() {
    if (!tokenKey) {
      setNeedAuth(true);
      return;
    }
    const params = [memoryIndex, 1];
    sendTransaction('addLike', params, { tokenAddress, address, sendType: 'sendAsync' })
    // No need to refresh as we already watch for like
    //.then(() => {
      //refrestLikeCount();
    //});

    // Change like to make quick feedback
    // the subscription will update number a couple of seconds later
    if (isMyLike) {
      setNumLike(numLike - 1);
    } else {
      setNumLike(numLike + 1);
    }
    setIsMyLike(!isMyLike);
  }

  const classes = useStyles();
  return (
    <StyledCardActions className={classes.acctionsBt}>
      <Button className={classes.button} onClick={handleLike}>
        {isMyLike ? (
          <React.Fragment>
            <FavoriteIcon fontSize="small" color="primary" className={classes.rightIcon} />
            <Typography component="span" variant="body2" color="primary">
              {numLike > 0 && ` ${numLike}`}
            </Typography>
          </React.Fragment>
        ) : (
          <React.Fragment>
            <FavoriteBorderIcon fontSize="small" className={classes.rightIcon} />
            <Typography component="span" variant="body2">
              {numLike > 0 && ` ${numLike}`}
            </Typography>
          </React.Fragment>
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
const mapDispatchToProps = dispatch => {
  return {
    setLikeTopInfo: value => {
      dispatch(actions.setLikeTopInfo(value));
    },
    setNeedAuth(value) {
      dispatch(actions.setNeedAuth(value));
    },
  };
};

export default connect(
  null,
  mapDispatchToProps
)(MemoryActionButton);
