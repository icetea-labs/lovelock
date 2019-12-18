import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import { Grid, CardActions, TextField, Typography } from '@material-ui/core';
import Link from '@material-ui/core/Link';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import { useSnackbar } from 'notistack';

import { ArrowTooltip, AvatarPro } from '../../elements';
import { callView, getTagsInfo, diffTime, TimeWithFormat, handleError } from '../../../helper';
import { useTx } from '../../../helper/hooks';
// import * as actions from '../../../store/actions';

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
  postComment: {
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
  linkViewMore: {
    color: '#8250c8',
    cursor: 'pointer',
    fontSize: 12,
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
    '&:hover': {
      background: '#f1f1f1',
    },
  },
  commentRow: {
    '&:hover': {
      '& $deleteIc': {
        display: 'block',
      },
    },
  },
  timeComment: {
    fontSize: 11,
    color: '#606770',
    padding: theme.spacing(0, 1.5),
  },
  deleteIc: {
    display: 'none',
    cursor: 'pointer',
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
const numComment = 4;
export default function MemoryComments(props) {
  const { handleNumberComment, memoryIndex, textInput } = props;

  const tx = useTx();
  const classes = useStyles();

  const avatar = useSelector(state => state.account.avatar);
  const address = useSelector(state => state.account.address);
  const memories = useSelector(state => state.loveinfo.memories);
  const memory = memories.filter(item => item.id === memoryIndex);
  const { enqueueSnackbar } = useSnackbar();
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);
  const [numHidencmt, setNumHidencmt] = useState(0);
  const [showComments, setShowComments] = useState([]);
  let myFormRef = useRef();

  useEffect(() => {
    let cancel = false;

    loadData(memoryIndex).then(respComment => {
      if (!cancel) {
        if (respComment.length > numComment) {
          const numMore = respComment.length - numComment;
          setNumHidencmt(numMore);
          setShowComments(respComment.slice(numMore));
        } else {
          setShowComments(respComment);
        }
        setComments(respComment);
        handleNumberComment(respComment.length);
      }
    });

    return () => {
      cancel = true;
    };
  }, [memoryIndex, comment]); // eslint-disable-line react-hooks/exhaustive-deps

  async function loadData(index) {
    const respComment = await callView('getCommentsByMemoIndex', [index]);
    let respTags = [];
    for (let i = 0; i < respComment.length; i++) {
      const resp = getTagsInfo(respComment[i].sender);
      respTags.push(resp);
    }
    respTags = await Promise.all(respTags);
    for (let i = 0; i < respComment.length; i++) {
      respComment[i].nick = respTags[i]['display-name'];
      respComment[i].avatar = respTags[i].avatar;
    }

    return respComment;
  }

  async function newComment() {
    if (!comment) return;

    tx.sendCommit('addComment', memoryIndex, comment, '')
      .then(e => {
        console.log('go', e);
      })
      .catch(err => {
        const message = handleError(err, 'sending comment');
        enqueueSnackbar(message, { variant: 'error' });
      });

    myFormRef.current && myFormRef.current.reset();
    setComment('');
  }

  function onKeyDownPostComment(event) {
    if (event.keyCode === 13 && !event.shiftKey) {
      event.preventDefault();
      event.stopPropagation();
      newComment();
    }
  }

  function viewMoreComment() {
    setShowComments(comments);
    setNumHidencmt(0);
  }
  async function deleteComment(item, indexKey) {
    const owner = [item.sender, memory[0].sender, memory[0].receiver];
    let cmtIndex = 0;
    if (numHidencmt > 0) {
      cmtIndex = indexKey + numHidencmt;
    } else {
      cmtIndex = indexKey;
    }
    if (!owner.includes(address)) {
      const message = `You cannot delete this comment.`;
      enqueueSnackbar(message, { variant: 'error' });
    } else {
      await tx.sendCommit('deleteComment', memoryIndex, cmtIndex);
      loadData(memoryIndex).then(respComment => {
        if (respComment.length > numComment) {
          const numMore = respComment.length - numComment;
          setNumHidencmt(numMore);
          setShowComments(respComment.slice(numMore));
        } else {
          setShowComments(respComment);
        }
        setComments(respComment);
        handleNumberComment(respComment.length);
      });
    }
  }
  // console.log('showComments', showComments);
  const renderViewMore = (
    <Grid item>
      <Link onClick={viewMoreComment} className={classes.linkViewMore}>
        View {numHidencmt} more comments
      </Link>
    </Grid>
  );
  const renderComments = (
    <>
      {showComments.map((item, indexKey) => {
        return (
          <Grid item key={indexKey} className={classes.commentRow}>
            <Grid container wrap="nowrap" spacing={1} alignItems="flex-start">
              <Grid item>
                <AvatarPro alt="img" className={classes.avatarContentComment} hash={item.avatar} />
              </Grid>
              <Grid item sx={10}>
                <Typography margin="dense" className={classes.contentComment}>
                  <Link href={`/u/${item.sender}`} className={classes.linkUserName}>{`${item.nick}`}</Link>
                  <span> {item.content}</span>
                </Typography>

                <ArrowTooltip title={<TimeWithFormat value={item.timestamp} format="dddd, MMMM Do YYYY, h:mm:ss a" />}>
                  <Typography margin="dense" className={classes.timeComment}>
                    {diffTime(item.timestamp)}
                  </Typography>
                </ArrowTooltip>
              </Grid>
              <Grid item sx={2}>
                <DeleteForeverIcon className={classes.deleteIc} onClick={() => deleteComment(item, indexKey)} />
              </Grid>
            </Grid>
          </Grid>
        );
      })}
    </>
  );
  const renderPostComment = (
    <Grid container wrap="nowrap" component="form" ref={myFormRef}>
      <Grid item>
        <AvatarPro alt="img" className={classes.avatarComment} hash={avatar} />
      </Grid>
      <Grid item classes={{ root: classes.btBox }}>
        <TextField
          fullWidth
          multiline
          className={classes.postComment}
          placeholder="Write a comment..."
          margin="dense"
          variant="outlined"
          size="smail"
          onChange={e => setComment(e.currentTarget.value.normalize())}
          onKeyDown={onKeyDownPostComment}
          InputProps={{
            classes: {
              notchedOutline: classes.notchedOutline,
            },
          }}
          inputRef={textInput}
        />
      </Grid>
    </Grid>
  );

  return (
    <StyledCardActions className={classes.boxComment}>
      <Grid container direction="column" spacing={1}>
        <Grid item>
          <Grid container direction="column" spacing={2} className={classes.boxCommentContent}>
            {numHidencmt > 0 && renderViewMore}
            {renderComments}
          </Grid>
        </Grid>
        <Grid item>{renderPostComment}</Grid>
      </Grid>
    </StyledCardActions>
  );
}
