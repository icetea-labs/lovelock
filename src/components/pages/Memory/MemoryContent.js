import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useSelector, connect } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import { Card, CardHeader, CardContent, IconButton, Typography } from '@material-ui/core';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import Tooltip from '@material-ui/core/Tooltip';
import LockIcon from '@material-ui/icons/Lock';
import CircularProgress from '@material-ui/core/CircularProgress';
import { useSnackbar } from 'notistack';
import Gallery from 'react-photo-gallery';
import Carousel, { Modal, ModalGateway } from 'react-images';
import FavoriteIcon from '@material-ui/icons/Favorite';

import * as actions from '../../../store/actions';
import {
  TimeWithFormat,
  decodeWithPublicKey,
  callView,
  getTagsInfo,
  saveMemCacheAPI,
  loadMemCacheAPI,
  decodeImg,
  getJsonFromIpfs,
} from '../../../helper';
import { AvatarPro } from '../../elements';
import MemoryActionButton from './MemoryActionButton';
import Editor from './Editor';
import SimpleModal from '../../elements/Modal';
import MemoryComments from './MemoryComments';
import MemoryTitle from './MemoryTitle';
import BlogShowcase from './BlogShowcase';

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
  icon: {
    fontSize: 18,
    verticalAlign: 'middle',
  },
  blogTitle: {
    color: '#707070',
    marginBottom: 16,
    display: 'block',
  },
  blogImgWrp: {
    position: 'relative',
    display: 'block',
    backgroundColor: '#333',
    padding: '0 0 16px',
    cursor: 'pointer',
    transition: 'background-color 1000ms linear',
    '&:hover $blogTitleImg, &:hover $blogFirstLine': {
      color: '#fff',
    },
  },
  blogTitleImg: {
    position: 'absolute',
    backgroundColor: '#666',
    transition: 'background-color 1000ms linear',
    top: 12,
    left: 12,
    padding: '3px 10px',
    color: '#f5f5f5',
  },
  blogImgTimeline: {
    width: '100%',
  },
  blogFirstLine: {
    display: 'block',
    textAlign: 'center',
    marginTop: 16,
    color: '#f5f5f5',
    fontSize: 16,
    textTransform: 'uppercase',
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
  editorComment: {
    width: 800,
    maxWidth: '100%',
    margin: '0 auto',
  },
}));

function MemoryContent(props) {
  const { memory, proIndex, setNeedAuth } = props;
  const privateKey = useSelector(state => state.account.privateKey);
  const publicKey = useSelector(state => state.account.publicKey);
  const address = useSelector(state => state.account.address);
  // const propose = useSelector(state => state.loveinfo.propose);

  const [memoryDecrypted, setMemoryDecrypted] = useState(memory);
  // const [memoryContent, setMemoryContent] = useState('');
  const [decoding, setDecoding] = useState(false);
  const [showComment, setShowComment] = useState(true);
  const [numComment, setNumComment] = useState(0);
  const { enqueueSnackbar } = useSnackbar();
  const [isOpenModal, setOpenModal] = useState(false);
  const [proposeInfo, setProposeInfo] = useState({});
  const classes = useStyles();

  // useEffect(() => {
  //   if (memoryDecrypted.isPrivate) {
  //     decodePrivateMemory();
  //   }
  // }, [privateKey, proIndex]);

  // useEffect(() => {
  //   // setMemoryDecrypted(memory);
  //   getMemoryContent();
  // }, [memory]);

  useEffect(() => {
    serialMemory();
  }, []);

  async function serialMemory() {
    let mem = memory;
    if (memory.isBlog) {
      const contentBlog = JSON.parse(memory.content);
      const data = await fetch(process.env.REACT_APP_IPFS + contentBlog.ipfsHash);
      const content = await data.json();
      mem.content = JSON.stringify(content);
    } else if (memory.isPrivate) {
      const memCache = await loadMemCacheAPI(memory.id);
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
  useEffect(() => {
    if (window.location.search !== '') {
      const url_string = window.location.href;
      const url = new URL(url_string);
      if (memory.id == url.searchParams.get('memory')) setOpenModal(true);
    }
  });

  useEffect(() => {
    (async () => {
      const proposes = await callView('getProposeByIndex', [proIndex]);
      const propose = proposes[0];
      const { sender, receiver } = propose;

      const senderTags = await getTagsInfo(sender);
      propose.s_name = senderTags['display-name'];
      propose.s_publicKey = senderTags['pub-key'] || '';
      propose.s_avatar = senderTags.avatar;

      const botInfo = propose.bot_info;
      if (receiver === process.env.REACT_APP_BOT_LOVER) {
        propose.r_name = `${botInfo.firstname} ${botInfo.lastname}`;
        propose.r_publicKey = senderTags['pub-key'] || '';
        propose.r_avatar = botInfo.botAva;
        propose.r_content = botInfo.botReply;
      } else {
        const receiverTags = await getTagsInfo(receiver);
        propose.r_name = receiverTags['display-name'];
        propose.r_publicKey = receiverTags['pub-key'] || '';
        propose.r_avatar = receiverTags.avatar;
        propose.r_content = propose.r_content;
      }
      setProposeInfo(propose);
    })();
  }, [proIndex]);

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
      // console.log(privateKey, '-', publicKey, obj.pubkey, !obj.isUnlock);
      if (!obj.isUnlock && privateKey && publicKey && obj.pubkey) {
        setDecoding(true);
        setTimeout(async () => {
          try {
            // loadMemCacheAPI(obj.id);
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
            obj.isUnlock = true;
            setMemoryDecrypted(obj);
            saveMemCacheAPI(obj, obj.id);
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

  function handerNumberComment(number) {
    setNumComment(number);
  }

  const textInput = useRef(null);
  function handerShowComment() {
    setShowComment(true);
    setTimeout(() => {
      textInput.current.focus();
    }, 100);
  }

  function decodeEditorMemory() {
    console.log(memoryDecrypted.content);
    try {
      const content = JSON.parse(memoryDecrypted.content);
      if (content) {
        return content;
      }
    } catch (e) {}
    return false;
  }

  // async function getMemoryContent() {
  //   try {
  //     let memoryContent = JSON.parse(memoryDecrypted.content);
  //     console.log('aaa', memoryContent);
  //     if (memoryContent.ipfsHash) {
  //       let ipfsHash = memoryContent.ipfsHash;
  //       let data = await fetch(process.env.REACT_APP_IPFS + ipfsHash);
  //       let content = await data.json();
  //       setMemoryContent(JSON.stringify(content));
  //     } else {
  //       setMemoryContent(memoryDecrypted.content);
  //     }
  //   } catch (e) {
  //     setMemoryContent(memoryDecrypted.content);
  //   }
  // }

  function previewEditorMemoryBlog() {
    let firstImg;
    let firstLine;

    try {
      const content = JSON.parse(memoryDecrypted.content);
      const { blocks } = content;

      for (const i in blocks) {
        if (!firstImg && blocks[i].type === 'image') {
          firstImg = blocks[i].data;
        }
        if (!firstLine) {
          firstLine = blocks[i].text;
          if (firstLine.length > 200) {
            firstLine = `${firstLine.slice(0, 200)}…`;
          }
        }
        if (firstImg && firstLine) break;
      }

      firstImg = firstImg || { url: '/static/img/memory-default.png' };
    } catch (error) {
      console.error(error);
    }

    return (
      <BlogShowcase
        classes={classes}
        firstImg={firstImg}
        firstLine={firstLine}
        openHandler={() => openMemory(memory.id)}
      />
    );
  }

  function openMemory(memoryId) {
    setOpenModal(true);
    window.history.pushState({}, '', `?memory=${memoryId}`);
  }

  function closeMemory() {
    setOpenModal(false);
    window.history.pushState({}, '', window.location.pathname);
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

  function unlockMemory() {
    if (privateKey) {
      decodePrivateMemory();
    } else {
      setNeedAuth(true);
    }
  }

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
          <Typography variant="body2" style={{ whiteSpace: 'pre-line' }} component="div">
            {memoryDecrypted.isBlog ? previewEditorMemoryBlog() : memoryDecrypted.content}
          </Typography>
        )}
        {decodeEditorMemory() && (
          <SimpleModal
            open={isOpenModal}
            handleClose={closeMemory}
            title={<MemoryTitle sender={proposeInfo.s_name} receiver={proposeInfo.r_name} handleClose={closeMemory} />}
            subtitle={<TimeWithFormat value={memoryDecrypted.info.date} format="h:mm a DD MMM YYYY" />}
          >
            <Editor initContent={decodeEditorMemory()} read_only />
            <div className={classes.editorComment}>
              {memoryDecrypted.isUnlock && (
                <MemoryActionButton
                  handerShowComment={handerShowComment}
                  likes={memory.likes}
                  memoryIndex={memory.id}
                  numComment={numComment}
                />
              )}
              {showComment && (
                <MemoryComments
                  handerNumberComment={handerNumberComment}
                  memoryIndex={memory.id}
                  memory={memory}
                  textInput={textInput}
                />
              )}
            </div>
          </SimpleModal>
        )}
      </React.Fragment>
    );
  };
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

  const { isUnlock } = memoryDecrypted;
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
        <CardContent>{isUnlock ? renderContentUnlock() : renderContentLocked()}</CardContent>
        {isUnlock && renderImgUnlock()}
        {isUnlock && renderActionBt}
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
