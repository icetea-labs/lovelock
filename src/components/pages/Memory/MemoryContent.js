import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import { Card, CardHeader, CardContent, CardMedia, IconButton, Typography } from '@material-ui/core';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import LockIcon from '@material-ui/icons/Lock';
import CircularProgress from '@material-ui/core/CircularProgress';
import { useSnackbar } from 'notistack';

import { TimeWithFormat, decodeWithPublicKey } from '../../../helper';
import { AvatarPro } from '../../elements';
import MemoryActionButton from './MemoryActionButton';
import MemoryComments from './MemoryComments';

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
  const { memory, proIndex, db } = props;
  const privateKey = useSelector(state => state.account.privateKey);
  const publicKey = useSelector(state => state.account.publicKey);
  const address = useSelector(state => state.account.address);
  const [memoryDecrypted, setMemoryDecrypted] = useState(memory);
  const [decoding, setDecoding] = useState(false);
  const [showComment, setShowComment] = useState(true);
  const [numComment, setNumComment] = useState(0);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    if (memoryDecrypted.isPrivate) {
      decodePrivateMemory();
    }
    // create the store
    // console.log('db', db);
  }, [privateKey, proIndex]);

  useEffect(() => {
    setMemoryDecrypted(memory);
  }, [memory]);

  function FacebookProgress(propsFb) {
    const classes = useStylesFacebook();

    return (
      <div className={classes.root}>
        <CircularProgress
          variant="determinate"
          value={100}
          className={classes.top}
          size={24}
          thickness={4}
          {...propsFb}
        />
        <CircularProgress
          variant="indeterminate"
          disableShrink
          className={classes.bottom}
          size={24}
          thickness={4}
          {...propsFb}
        />
      </div>
    );
  }

  function decodePrivateMemory() {
    setTimeout(() => {
      const obj = Object.assign({}, memoryDecrypted);
      if (privateKey && publicKey && obj.pubkey && !obj.isUnlock) {
        setDecoding(true);
        setTimeout(async () => {
          try {
            let key = obj.pubkey;
            if (address === obj.sender) {
              key = publicKey;
            }
            obj.content = await decodeWithPublicKey(JSON.parse(obj.content || '{}'), privateKey, key);
            obj.info = await decodeWithPublicKey(obj.info, privateKey, key);
            obj.info = JSON.parse(obj.info || '{}');
            obj.isUnlock = true;
            setMemoryDecrypted(obj);
          } catch (e) {
            const message = JSON.stringify(e);
            enqueueSnackbar(message, { variant: 'error' });
            setDecoding(false);
          }
        }, 100);
      } else {
        // const message = 'Request sharekey';
        // enqueueSnackbar(message, { variant: 'error' });
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
        avatar={<AvatarPro alt="img" hash={memoryDecrypted.avatar} />}
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
        <MemoryActionButton
          handerShowComment={handerShowComment}
          likes={memory.likes}
          memoryIndex={memory.id}
          numComment={numComment}
        />
      )}
      {showComment && (
        <MemoryComments handerNumberComment={handerNumberComment} memoryIndex={memory.id} memory={memory} />
      )}
    </Card>
  );
}
