import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import { Card, CardHeader, CardContent, CardMedia } from '@material-ui/core';
import { IconButton } from '@material-ui/core';
import { Avatar, Typography } from '@material-ui/core';
import { TimeWithFormat, decodeWithPublicKey } from '../../../helper';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import LockIcon from '@material-ui/icons/Lock';
// import ThumbUpIcon from '@material-ui/icons/ThumbUp';
// import CommentIcon from '@material-ui/icons/Comment';
// import ShareIcon from '@material-ui/icons/Share';
import CircularProgress from '@material-ui/core/CircularProgress';
// import * as actions from '../../../store/actions';
import BoxActionButton from './BoxActionButton';

import Comments from './Comments';

const useStylesFacebook = makeStyles({
  root: {
    position: 'relative',
  },
  top: {
    color: '#eef3fd',
  },
  bottom: {
    color: '#6798e5',
    animationDuration: '550ms',
    position: 'absolute',
    left: 0,
  },
});

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

export default function MemoryContent(props) {
  const { memory, proIndex } = props;
  const privateKey = useSelector(state => state.account.privateKey);
  const publicKey = useSelector(state => state.account.publicKey);
  const address = useSelector(state => state.account.address);
  const [memoryDecrypted, setMemoryDecrypted] = useState(memory);
  const [decoding, setDecoding] = useState(false);
  const [showComment, setShowComment] = useState(true);
  // const [numLike, setNumLike] = useState(0);
  const [numComment, setNumComment] = useState(0);

  useEffect(() => {
    if (memoryDecrypted.isPrivate) {
      decodePrivateMemory(privateKey);
    }
  }, [privateKey, proIndex]);

  useEffect(() => {
    setMemoryDecrypted(props.memory);
  }, [props.memory]);

  function FacebookProgress(props) {
    const classes = useStylesFacebook();

    return (
      <div className={classes.root}>
        <CircularProgress
          variant="determinate"
          value={100}
          className={classes.top}
          size={24}
          thickness={4}
          {...props}
        />
        <CircularProgress
          variant="indeterminate"
          disableShrink
          className={classes.bottom}
          size={24}
          thickness={4}
          {...props}
        />
      </div>
    );
  }

  function decodePrivateMemory(privateKey) {
    setTimeout(() => {
      const obj = Object.assign({}, memoryDecrypted);
      if (privateKey && publicKey && obj.pubkey && !obj.isUnlock) {
        setDecoding(true);
        setTimeout(async () => {
          try {
            if (address === obj.sender) {
              obj.content = await decodeWithPublicKey(JSON.parse(obj.content), privateKey, publicKey);
            } else {
              obj.content = await decodeWithPublicKey(JSON.parse(obj.content), privateKey, obj.pubkey);
            }
            obj.isUnlock = true;
            setMemoryDecrypted(obj);
          } catch (e) {
            console.log(e);
            setDecoding(false);
          }
        }, 100);
      } else {
        console.log('Request sharekey');
      }
    }, 500);
  }

  function handerNumberComment(number) {
    setNumComment(number);
  }
  function handerShowComment() {
    setShowComment(true);
  }

  const classes = useStyles();

  return (
    <Card key={memoryDecrypted.index} className={classes.card}>
      <CardHeader
        avatar={<Avatar alt="avata" src={process.env.REACT_APP_IPFS + memoryDecrypted.avatar} />}
        title={memoryDecrypted.name}
        subheader={<TimeWithFormat value={memoryDecrypted.info.date} format="h:mm a DD MMM YYYY" />}
        action={
          <IconButton aria-label="settings">
            <MoreVertIcon />
          </IconButton>
        }
      />
      <CardContent>
        {memoryDecrypted.isPrivate && !memoryDecrypted.isUnlock ? (
          <React.Fragment>
            {decoding ? (
              <span>
                <FacebookProgress /> Unlock...
              </span>
            ) : (
              <IconButton aria-label="settings">
                <LockIcon />
              </IconButton>
            )}
          </React.Fragment>
        ) : (
          <Typography variant="body2" style={{ whiteSpace: 'pre-line' }} component="p">
            {memoryDecrypted.content}
          </Typography>
        )}
      </CardContent>
      <React.Fragment>
        {memoryDecrypted.info.hash && (
          <CardMedia
            className={classes.media}
            image={process.env.REACT_APP_IPFS + memoryDecrypted.info.hash}
            title="img"
          />
        )}
        {/* <ImageGridList
              imgs={[
                { img: 'https://ipfs.io/ipfs/' + memory.info.hash, clos: 2 },
                { img: 'https://ipfs.io/ipfs/' + memory.info.hash },
                { img: 'https://ipfs.io/ipfs/' + memory.info.hash },
              ]}
            /> */}
      </React.Fragment>
      {memoryDecrypted.isPrivate && !memoryDecrypted.isUnlock ? (
        ''
      ) : (
        <BoxActionButton handerShowComment={handerShowComment} likes={memory.likes} memoryIndex={memory.id} />
      )}
      {showComment && <Comments handerNumberComment={handerNumberComment} memoryIndex={memory.id} />}
    </Card>
  );
}
