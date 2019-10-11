import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { CardActions, Button, Typography } from '@material-ui/core';
import CommentIcon from '@material-ui/icons/Comment';
import FavoriteIcon from '@material-ui/icons/Favorite';
import FavoriteBorderIcon from '@material-ui/icons/FavoriteBorder';
import ShareIcon from '@material-ui/icons/Share';
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

export default function MemoryActionButton(props) {
  const { memoryIndex, handerShowComment, numComment } = props;
  const dispatch = useDispatch();

  // const privateKey = useSelector(state => state.account.privateKey);
  const address = useSelector(state => state.account.address);
  const tokenAddress = useSelector(state => state.account.tokenAddress);
  const tokenKey = useSelector(state => state.account.tokenKey);

  const [numLike, setNumLike] = useState(0);
  const [isMyLike, setIsMyLike] = useState(false);
  // const [numComment, setNumComment] = useState(0);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    getNumLikes();
  }, [memoryIndex]);

  async function getNumLikes() {
    const data = await callView('getLikeByMemoIndex', [memoryIndex]);
    const num = Object.keys(data).length;
    if (data[address]) {
      setIsMyLike(true);
    } else {
      setIsMyLike(false);
    }
    setNumLike(num);
  }

  useEffect(() => {
    const returnValue = watchAddlike();
    return () => {
      Promise.resolve(returnValue).then(({ unsubscribe }) => unsubscribe());
    };
  }, [memoryIndex]);

  function watchAddlike() {
    const filter = {};
    return tweb3.contract(process.env.REACT_APP_CONTRACT).events.addLike(filter, async error => {
      if (error) {
        const message = 'Watch addlike error';
        enqueueSnackbar(message, { variant: 'error' });
        console.log('watchAddlike', error);
      } else {
        // console.log('watchAddlike', result);
        getNumLikes();
      }
    });
  }

  async function handerLike() {
    if (!tokenKey) {
      dispatch(actions.setNeedAuth(true));
      return;
    }
    const method = 'addLike';
    const params = [memoryIndex, 1];
    await sendTransaction(method, params, { tokenAddress, address });
  }

  const classes = useStyles();
  return (
    <StyledCardActions className={classes.acctionsBt}>
      <Button className={classes.button} onClick={handerLike}>
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
        {/* <CommentIcon fontSize="small" className={classes.rightIcon} /> */}
        {numComment > 0 && (numComment === 1 ? `${numComment} Comment` : `${numComment} Comments`)}
        {numComment === 0 && 'Comment'}
      </Button>
      {/* <Button className={classes.button}>
        <ShareIcon fontSize="small" className={classes.rightIcon} />
        Share
      </Button> */}
    </StyledCardActions>
  );
}
