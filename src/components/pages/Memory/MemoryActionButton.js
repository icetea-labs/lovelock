import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import * as actions from '../../../store/actions';
import { makeStyles } from '@material-ui/core/styles';
import { withStyles } from '@material-ui/styles';
import { CardActions } from '@material-ui/core';
import ThumbUpIcon from '@material-ui/icons/ThumbUp';
import CommentIcon from '@material-ui/icons/Comment';
import ShareIcon from '@material-ui/icons/Share';
import { Button } from '@material-ui/core';
import { sendTransaction, callView } from '../../../helper';

const useStyles = makeStyles(theme => ({
  button: {
    color: 'rgba(0, 0, 0, 0.54)',
    width: '100%',
  },
  rightIcon: {
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
  const { memoryIndex, handerShowComment, likes } = props;
  const dispatch = useDispatch();
  const privateKey = useSelector(state => state.account.privateKey);
  const [numLike, setNumLike] = useState(Object.keys(likes || {}).length || 0);
  const [numComment, setNumComment] = useState(0);

  useEffect(() => {
    loaddata(memoryIndex);
  }, [memoryIndex]);

  async function loaddata(index) {
    const likes = await callView('getLikeByMemoIndex', [index]);
    const numLike = Object.keys(likes).length;
    setNumLike(numLike);
  }

  async function handerLike() {
    if (!privateKey) {
      dispatch(actions.setNeedAuth(true));
      return;
    }
    const method = 'addLike';
    let params = [memoryIndex, 1];
    // console.log('memoryIndex', memoryIndex);
    const result = await sendTransaction(method, params);
    if (result) {
      loaddata(memoryIndex);
    }
  }

  const classes = useStyles();
  return (
    <StyledCardActions className={classes.acctionsBt}>
      <Button className={classes.button} onClick={handerLike}>
        <ThumbUpIcon fontSize="small" className={classes.rightIcon} />
        Like {numLike > 0 && `( ${numLike} )`}
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
