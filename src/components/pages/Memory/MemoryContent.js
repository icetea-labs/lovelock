import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Avatar from '@material-ui/core/Avatar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import CardActions from '@material-ui/core/CardActions';
// import Skeleton from '@material-ui/lab/Skeleton';
import { TimeWithFormat, decodeWithPublicKey } from '../../../helper';
import MoreVertIcon from '@material-ui/icons/MoreVert';
// import LockOpenIcon from '@material-ui/icons/LockOpen';
import LockIcon from '@material-ui/icons/Lock';
import ThumbUpIcon from '@material-ui/icons/ThumbUp';
import CommentIcon from '@material-ui/icons/Comment';
import ShareIcon from '@material-ui/icons/Share';
import Tooltip from '@material-ui/core/Tooltip';
import CircularProgress from '@material-ui/core/CircularProgress';

const useStyles = makeStyles(theme => ({
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
}));

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

export default function MemoryContent(props) {
  const classes = useStyles();
  const { privateKey, publicKey, address } = useSelector(state => state.account);
  // console.log('memory', memory);
  // console.log('memoryDecrypted', memoryDecrypted);
  const [memoryDecrypted, setMemoryDecrypted] = useState(props.memory);
  const [decoding, setDecoding] = useState(false);

  useEffect(() => {
    if (memoryDecrypted.isPrivate) {
      decodePrivateMemory(privateKey, props.proIndex);
    }
  }, [privateKey, props.proIndex]);

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

  function decodePrivateMemory(privateKey, proIndex) {
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

  return (
    <Card key={memoryDecrypted.index} className={classes.card}>
      <CardHeader
        avatar={<Avatar alt="avata" src="/static/img/user-women.jpg" />}
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
        <CardActions>
          <Tooltip title="Like">
            <IconButton aria-label="add to like">
              <ThumbUpIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Comment">
            <IconButton aria-label="add to message">
              <CommentIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Share">
            <IconButton aria-label="share">
              <ShareIcon />
            </IconButton>
          </Tooltip>
        </CardActions>
      )}
    </Card>
  );
}
