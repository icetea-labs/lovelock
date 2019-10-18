import React, { useEffect, useState, useCallback } from 'react';
import { useSelector, connect } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import { Card, CardHeader, CardContent, IconButton, Typography } from '@material-ui/core';
import Link from '@material-ui/core/Link';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import LockIcon from '@material-ui/icons/Lock';
import Tooltip from '@material-ui/core/Tooltip';
import CircularProgress from '@material-ui/core/CircularProgress';
import { useSnackbar } from 'notistack';
// import Gallery from 'react-grid-gallery';
import Gallery from 'react-photo-gallery';
import Carousel, { Modal, ModalGateway } from 'react-images';
import FavoriteIcon from '@material-ui/icons/Favorite';

import { TimeWithFormat, decodeWithPublicKey, decodeImg, getJsonFromIpfs } from '../../../helper';
import { AvatarPro } from '../../elements';
import MemoryActionButton from './MemoryActionButton';
import Editor from './Editor';
import SimpleModal from '../../elements/Modal';
import MemoryComments from './MemoryComments';
import * as actions from '../../../store/actions';

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
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    overflow: 'hidden',
    backgroundColor: theme.palette.background.paper,
  },
  gridList: {
    width: 500,
    height: 450,
  },
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
  seeMore: {
    cursor: 'pointer',
    marginTop: 10,
    display: 'inline-block',
  },
  relationship: {
    // color: theme.color.primary,
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 2,
  },
  relationshipName: {
    textTransform: 'capitalize',
    color: '#8250c8',
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

function MemoryContent(props) {
  const { memory, setNeedAuth } = props;
  const privateKey = useSelector(state => state.account.privateKey);
  const publicKey = useSelector(state => state.account.publicKey);
  const address = useSelector(state => state.account.address);
  // const propose = useSelector(state => state.loveinfo.propose);

  const [memoryDecrypted, setMemoryDecrypted] = useState(memory);
  const [decoding, setDecoding] = useState(false);
  const [showComment, setShowComment] = useState(true);
  const [numComment, setNumComment] = useState(0);
  const [isOpenModal, setOpenModal] = useState(false);

  const { enqueueSnackbar } = useSnackbar();
  const classes = useStyles();
  // useEffect(() => {
  //   if (memoryDecrypted.isPrivate) {
  //     decodePrivateMemory();
  //   }

  //   // create the store
  //   // console.log('db', db);
  // }, [proIndex]);

  useEffect(() => {
    serialMemory();
  }, []);

  async function serialMemory() {
    let mem = memory;
    if (memory.isPrivate) {
      const memCache = await loadCacheAPI(memory.id);
      if (memCache) {
        mem = memCache;
        for (let i = 0; i < mem.info.hash.length; i++) {
          const newBuffer = Buffer.from(mem.info.buffer[i]);
          // mem.info.hash[i] = await getJsonFromIpfs(newBuffer, i);
          const blob = new Blob([newBuffer], { type: 'image/jpeg' });
          mem.info.hash[i].src = URL.createObjectURL(blob);
        }
      }
      // console.log('mem', mem, 'id=', memory.id);
    }

    setMemoryDecrypted(mem);
  }

  function FacebookProgress(propsFb) {
    const classesFb = useStylesFacebook();

    return (
      <div className={classesFb.root}>
        <CircularProgress
          variant="determinate"
          value={100}
          className={classesFb.top}
          size={24}
          thickness={4}
          {...propsFb}
        />
        <CircularProgress
          variant="indeterminate"
          disableShrink
          className={classesFb.bottom}
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
      // console.log(privateKey, '-', publicKey, obj.pubkey, !obj.isLocked);
      if (privateKey && publicKey && obj.pubkey && obj.isLocked) {
        setDecoding(true);
        setTimeout(async () => {
          try {
            loadCacheAPI(obj.id);
            let partnerKey = obj.pubkey;
            if (address === obj.sender) {
              partnerKey = publicKey;
            }
            obj.content = await decodeWithPublicKey(JSON.parse(obj.content || '{}'), privateKey, partnerKey);
            for (let i = 0; i < obj.info.hash.length; i++) {
              // eslint-disable-next-line no-await-in-loop
              const decodeBufferData = await decodeImg(obj.info.hash[i], privateKey, partnerKey);
              // eslint-disable-next-line no-await-in-loop
              obj.info.hash[i] = await getJsonFromIpfs(decodeBufferData, i);
              if (!obj.info.buffer) obj.info.buffer = [];
              obj.info.buffer[i] = decodeBufferData;
            }
            obj.isLocked = false;
            setMemoryDecrypted(obj);
            saveCacheAPI(obj, obj.id);
          } catch (error) {
            console.error(error);
            const message = JSON.stringify(error);
            enqueueSnackbar(message, { variant: 'error' });
            setDecoding(false);
          }
        }, 100);
      } else {
        const message = `An error occurred, please try again later`;
        enqueueSnackbar(message, { variant: 'error' });
      }
    }, 100);
  }

  function saveCacheAPI(memoryContent, id) {
    if (!('caches' in window.self)) {
      // eslint-disable-next-line no-alert
      alert('Cache API is not supported.');
    } else {
      const cacheName = 'lovelock-private';
      caches.open(cacheName).then(cache => {
        if (!memoryContent) {
          // eslint-disable-next-line no-alert
          alert('Please select a file first!');
          return;
        }
        const response = new Response(JSON.stringify(memoryContent));
        cache.put(`memo/${id}`, response).then(() => {
          // alert('Saved!');
        });
      });
    }
  }

  async function loadCacheAPI(id) {
    let json;
    if (!('caches' in window.self)) {
      alert('Cache API is not supported.');
    } else {
      const cacheName = 'lovelock-private';
      const cache = await caches.open(cacheName);
      const response = await cache.match(`memo/${id}`);
      json = response && (await response.json());
    }
    // console.log('response', json);
    return json;
  }

  function handerNumberComment(number) {
    setNumComment(number);
  }
  function handerShowComment() {
    setShowComment(true);
  }

  function decodeEditorMemory() {
    try {
      let content = JSON.parse(memoryDecrypted.content);
      if (content) {
        return content;
      }
    } catch (e) {}
    return false;
  }

  function previewEditorMemory() {
    try {
      let content = JSON.parse(memoryDecrypted.content);
      if (content) {
        // console.log(content);
        return content.blocks.map((line, i) => {
          if (i <= 3) {
            return (
              <span key={i}>
                <span>{line.text}</span>
                <br />
              </span>
            );
          }
        });
      }
    } catch (e) {}
    return memoryDecrypted.content;
  }

  function unlockMemory() {
    if (privateKey) {
      decodePrivateMemory();
    } else {
      setNeedAuth(true);
    }
  }

  const [currentImage, setCurrentImage] = useState(0);
  const [viewerIsOpen, setViewerIsOpen] = useState(false);

  const openLightbox = useCallback((event, { index }) => {
    setCurrentImage(index);
    setViewerIsOpen(true);
  }, []);
  const closeLightbox = () => {
    setCurrentImage(0);
    setViewerIsOpen(false);
  };

  const renderContentLocked = () => {
    return (
      <React.Fragment>
        {decoding ? (
          <span>
            <FacebookProgress /> Unlock...
          </span>
        ) : (
          <Tooltip title="Click to view item">
            <IconButton aria-label="settings" onClick={unlockMemory}>
              <LockIcon fontSize="large" />
            </IconButton>
          </Tooltip>
        )}
      </React.Fragment>
    );
  };
  const renderContentUnlock = () => {
    return (
      <React.Fragment>
        {memoryDecrypted.type === 1 ? (
          <Typography
            variant="body2"
            className={classes.relationship}
            style={{ whiteSpace: 'pre-line' }}
            component="div"
          >
            <div>
              <FavoriteIcon color="primary" fontSize="large" />
            </div>
            <span>
              <span>In a Relationship with </span>
              <Typography component="span" className={classes.relationshipName}>
                {memoryDecrypted.r_name}
              </Typography>
            </span>
          </Typography>
        ) : (
          <Typography variant="body2" style={{ whiteSpace: 'pre-line' }} component="p">
            {previewEditorMemory()}
          </Typography>
        )}
      </React.Fragment>
    );
  };
  const renderImgLocked = '';
  const renderImgUnlock = () => {
    return (
      <div style={{ maxHeight: '1500px', overflow: 'hidden' }}>
        {memoryDecrypted.info.hash && (
          <Gallery
            // targetRowHeight={300}
            // containerWidth={600}
            photos={memoryDecrypted.info.hash.slice(0, 5)}
            onClick={openLightbox}
          />
        )}
      </div>
    );
  };
  const renderActionBt = (
    <MemoryActionButton
      handerShowComment={handerShowComment}
      likes={memory.likes}
      memoryIndex={memory.id}
      numComment={numComment}
    />
  );
  const renderComments = (
    <MemoryComments handerNumberComment={handerNumberComment} memoryIndex={memory.id} memory={memory} />
  );
  const { isLocked } = memoryDecrypted;
  return (
    <React.Fragment>
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
          {isLocked ? renderContentLocked() : renderContentUnlock()}
          {decodeEditorMemory() && (
            <>
              <Link onClick={() => setOpenModal(true)} className={classes.seeMore}>
                See more...
              </Link>
              <SimpleModal
                open={isOpenModal}
                handleClose={() => setOpenModal(false)}
                closeText="Close"
                // title={`${memoryDecrypted.name} > ${propose[0].name}`}
                subtitle={<TimeWithFormat value={memoryDecrypted.info.date} format="h:mm a DD MMM YYYY" />}
              >
                <Editor initContent={decodeEditorMemory()} read_only={true} />
              </SimpleModal>
            </>
          )}
        </CardContent>
        {isLocked ? renderImgLocked : renderImgUnlock()}
        {renderActionBt}
        {showComment && renderComments}
      </Card>
      <ModalGateway>
        {viewerIsOpen ? (
          <Modal onClose={closeLightbox} style={{ zIndex: 3 }}>
            <Carousel
              currentIndex={currentImage}
              views={memoryDecrypted.info.hash.map(x => ({
                ...x,
                srcset: x.srcSet,
                caption: x.title,
              }))}
            />
          </Modal>
        ) : null}
      </ModalGateway>
    </React.Fragment>
  );
}
// const mapStateToProps = state => {
//   return {
//     privateKey: state.account.privateKey,
//   };
// };

const mapDispatchToProps = dispatch => {
  return {
    setMemory: value => {
      dispatch(actions.setMemory(value));
    },
    setNeedAuth(value) {
      dispatch(actions.setNeedAuth(value));
    },
  };
};

export default connect(
  null,
  mapDispatchToProps
)(MemoryContent);
