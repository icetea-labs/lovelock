import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { CardActions, Button, Typography } from '@material-ui/core';
import CommentIcon from '@material-ui/icons/Comment';
import FavoriteIcon from '@material-ui/icons/Favorite';
import FavoriteBorderIcon from '@material-ui/icons/FavoriteBorder';
import ShareIcon from '@material-ui/icons/Share';
import { withStyles, makeStyles } from '@material-ui/core/styles';

import * as actions from '../../../store/actions';
import { sendTransaction, callView } from '../../../helper';

const useStyles = makeStyles(theme => ({
  button: {
    color: 'rgba(0, 0, 0, 0.54)',
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
    justifyContent: 'space-around',
  },
}));
const StyledCardActions = withStyles(theme => ({
  root: {
    padding: theme.spacing(0.4, 2),
    borderTop: '1px solid #e1e1e1',
  },
}))(CardActions);

export default function MemoryActionButton(props) {
  const { memoryIndex, handerShowComment } = props;
  const dispatch = useDispatch();
  const privateKey = useSelector(state => state.account.privateKey);
  const address = useSelector(state => state.account.address);
  const [numLike, setNumLike] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [numComment, setNumComment] = useState(0);

  useEffect(() => {
    loaddata(memoryIndex);
  }, [memoryIndex]);

  async function loaddata(index) {
    const data = await callView('getLikeByMemoIndex', [index]);
    const num = Object.keys(data).length;
    if (data[address]) {
      setIsLiked(true);
    } else {
      setIsLiked(false);
    }
    setNumLike(num);
  }

  async function handerLike() {
    if (!privateKey) {
      dispatch(actions.setNeedAuth(true));
      return;
    }
    const method = 'addLike';
    const params = [memoryIndex, 1];
    const result = await sendTransaction(method, params);
    if (result) {
      loaddata(memoryIndex);
    }
  }

  const classes = useStyles();
  return (
    <StyledCardActions className={classes.acctionsBt}>
      <Button className={classes.button} onClick={handerLike}>
        {isLiked ? (
          <React.Fragment>
            <FavoriteIcon fontSize="small" color="primary" className={classes.rightIcon} />
            <Typography component="span" variant="body2" color="primary">
              Congrats {numLike > 0 && `( ${numLike} )`}
            </Typography>
          </React.Fragment>
        ) : (
          <React.Fragment>
            <FavoriteBorderIcon fontSize="small" className={classes.rightIcon} />
            <Typography component="span" variant="body2">
              Congrats {numLike > 0 && `( ${numLike} )`}
            </Typography>
          </React.Fragment>
        )}
      </Button>

      <Button className={classes.button} onClick={handerShowComment}>
        <CommentIcon fontSize="small" className={classes.rightIcon} />
        Comment {numComment > 0 && `( ${numComment} )`}
      </Button>
      <Button className={classes.button}>
        <ShareIcon fontSize="small" className={classes.rightIcon} />
        Share
      </Button>
    </StyledCardActions>
  );
}
