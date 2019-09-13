import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import { withStyles } from '@material-ui/styles';
import { Grid, CardActions } from '@material-ui/core';
import { Avatar, TextField, Typography } from '@material-ui/core';
import Link from '@material-ui/core/Link';

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
}));

const StyledCardActions = withStyles(theme => ({
  root: {
    padding: theme.spacing(0.4, 2),
    borderTop: '1px solid #e1e1e1',
  },
}))(CardActions);

export default function Comments(props) {
  const { handerNumberComment } = props;
  const displayName = useSelector(state => state.account.displayName);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([{ text: '1' }, { text: '2' }, { text: '3' }]);
  let myFormRef = React.createRef();

  function newComment() {
    if (comment) {
      const newArray = [...comments, { text: comment }];
      setComments(newArray);
      setComment('');
      handerNumberComment(newArray.length);
    }
  }
  function onKeyDownPostComment(event) {
    if (event.keyCode === 13 && !event.shiftKey) {
      event.preventDefault();
      event.stopPropagation();
      newComment();
      myFormRef.reset();
    }
  }

  const classes = useStyles();

  return (
    <StyledCardActions className={classes.boxComment}>
      <Grid container direction="column">
        <Grid container direction="column" spacing={2} className={classes.boxCommentContent}>
          {comments.map((item, index) => {
            return (
              <Grid item key={index}>
                <Grid container wrap="nowrap" spacing={2} alignItems="flex-start">
                  <Grid item>
                    <Avatar alt="avata" className={classes.avatarContentComment} src="/static/img/user-women.jpg" />
                  </Grid>
                  <Grid item>
                    <Typography margin="dense" className={classes.contentComment}>
                      <Link to="/" className={classes.linkUserName}>{`${displayName}`}</Link>
                      <span> {item.text}</span>
                    </Typography>
                    <Link className={classes.buttonLike}>Like</Link>
                    <span className={classes.bullet}>•</span>
                    <Link className={classes.buttonLike}>Reply</Link>
                  </Grid>
                </Grid>
              </Grid>
            );
          })}
        </Grid>
        <Grid item>
          <Grid
            container
            wrap="nowrap"
            alignItems="flex-start"
            component="form"
            ref={el => (myFormRef = el)}
            // onSubmit={newComment}
          >
            <Grid item>
              <Avatar alt="avata" className={classes.avatarComment} src="/static/img/user-women.jpg" />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                autoFocus
                // value={comment}
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
