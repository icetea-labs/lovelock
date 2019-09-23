import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import { Grid, CardActions, TextField, Typography } from '@material-ui/core';
import Link from '@material-ui/core/Link';

import AvatarPro from '../../elements/AvatarPro';
import { sendTransaction, callView, getTags } from '../../../helper';
import * as actions from '../../../store/actions';

const useStyles = makeStyles(theme => ({
  avatarComment: {
    marginTop: 10,
    marginRight: 10,
    width: 30,
    height: 30,
  },
  buttonLike: {
    fontSize: 10,
    padding: theme.spacing(1),
    cursor: 'pointer',
  },
  avatarContentComment: {
    width: 30,
    height: 30,
  },
  textComment: {
    [`& fieldset`]: {
      borderRadius: 20,
      background: 'transparent',
    },
    borderRadius: 20,
    background: '#f5f6f7',
    fontSize: 12,
  },
  notchedOutline: {
    // borderWidth: '1px',
    // borderColor: 'yellow !important',
  },
  notchedOutlineComment: {
    borderWidth: '0px',
    color: 'red',
  },
  linkUserName: {
    color: '#8250c8',
    textTransform: 'capitalize',
    cursor: 'pointer',
    marginRight: theme.spacing(0.8),
  },
  bullet: {
    display: 'inline-block',
    margin: '0 1px',
    transform: 'scale(0.5)',
    color: '#fe8dc3',
  },
  boxComment: {
    borderTop: '1px solid #e1e1e1',
  },
  contentComment: {
    background: '#f5f6f7',
    padding: theme.spacing(0.8, 1.5),
    borderRadius: 20,
    fontSize: 12,
  },
  boxCommentContent: {
    marginTop: theme.spacing(1),
  },
  btBox: {
    // display: 'flex',
    // minWidth: '100%',
    width: '100%',
    // justifyContent: 'space-between',
  },
}));

const StyledCardActions = withStyles(theme => ({
  root: {
    padding: theme.spacing(0.4, 2),
    borderTop: '1px solid #e1e1e1',
  },
}))(CardActions);

export default function MemoryContent(props) {
  const { handerNumberComment, memoryIndex } = props;
  const dispatch = useDispatch();
  const privateKey = useSelector(state => state.account.privateKey);
  const avatar = useSelector(state => state.account.avatar);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);
  let myFormRef = React.createRef();

  useEffect(() => {
    loaddata(memoryIndex);
  }, [memoryIndex]);

  async function loaddata(index) {
    const coms = await callView('getCommentsByMemoIndex', [index]);
    for (let i = 0; i < coms.length; i++) {
      const element = coms[i];
      const tags = await getTags(element.sender);
      coms[i].nick = tags['display-name'];
      coms[i].avatar = tags.avatar;
    }
    setComments(coms);
  }

  async function newComment() {
    if (!privateKey) {
      dispatch(actions.setNeedAuth(true));
      return;
    }
    const method = 'addComment';
    const params = [memoryIndex, comment, ''];
    // console.log('memoryIndex', memoryIndex);
    const result = await sendTransaction(method, params);
    if (result) {
      loaddata(memoryIndex);
    }
    myFormRef.reset();
  }

  function onKeyDownPostComment(event) {
    if (event.keyCode === 13 && !event.shiftKey) {
      event.preventDefault();
      event.stopPropagation();
      newComment();
    }
  }

  const classes = useStyles();

  return (
    <StyledCardActions className={classes.boxComment}>
      <Grid container direction="column" spacing={1}>
        <Grid item>
          <Grid container direction="column" spacing={2} className={classes.boxCommentContent}>
            {comments.map((item, indexKey) => {
              return (
                <Grid item key={indexKey}>
                  <Grid container wrap="nowrap" spacing={2} alignItems="flex-start">
                    <Grid item>
                      <AvatarPro alt="img" className={classes.avatarContentComment} hash={item.avatar} />
                    </Grid>
                    <Grid item sx={12}>
                      <Typography margin="dense" className={classes.contentComment}>
                        <Link to="/" className={classes.linkUserName}>{`${item.nick}`}</Link>
                        <span> {item.content}</span>
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>
              );
            })}
          </Grid>
        </Grid>
        <Grid item>
          <Grid container wrap="nowrap" component="form" ref={el => (myFormRef = el)}>
            <Grid item>
              <AvatarPro alt="img" className={classes.avatarComment} hash={avatar} />
            </Grid>
            <Grid item classes={{ root: classes.btBox }}>
              <TextField
                fullWidth
                multiline
                className={classes.textComment}
                placeholder="Write a comment..."
                margin="dense"
                variant="outlined"
                size="smail"
                onChange={e => setComment(e.currentTarget.value)}
                onKeyDown={onKeyDownPostComment}
                InputProps={{
                  classes: {
                    notchedOutline: classes.notchedOutline,
                  },
                }}
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </StyledCardActions>
  );
}
