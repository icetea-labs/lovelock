import React, { useEffect, useState, useCallback } from 'react';
import { useSelector, connect } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import { Card, CardHeader, CardContent, IconButton, Typography, Menu, MenuItem, Link } from '@material-ui/core';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import Tooltip from '@material-ui/core/Tooltip';
import LockIcon from '@material-ui/icons/Lock';
import CircularProgress from '@material-ui/core/CircularProgress';
import { useSnackbar } from 'notistack';
import Gallery from 'react-photo-gallery';
import Carousel, { Modal, ModalGateway } from 'react-images';
import FavoriteIcon from '@material-ui/icons/Favorite';
import WavesIcon from '@material-ui/icons/Waves';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';
import { Helmet } from 'react-helmet';
import Linkify from 'react-linkify';

import * as actions from '../../../store/actions';
import {
  TimeWithFormat,
  decodeWithPublicKey,
  saveMemCacheAPI,
  loadMemCacheAPI,
  decodeImg,
  getJsonFromIpfs,
  makeLockName,
  signalPrerenderDone,
  smartFetchIpfsJson,
  ensureHashUrl,
  copyToClipboard
} from '../../../helper';
import { AvatarPro } from '../../elements';
import MemoryActionButton from './MemoryActionButton';
import Editor from './Editor';
import BlogModal from '../../elements/BlogModal';
import MemoryComments from './MemoryComments';
import MemoryTitle from './MemoryTitle';
import BlogShowcase from './BlogShowcase';
import CommonDialog from "../../elements/CommonDialog";
import CreateMemory from "./CreateMemory";
import appConstants from "../../../helper/constants";
import UserLinkify from "../../elements/Common/UserLinkify";

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
    paddingBottom: 16,
    cursor: 'pointer',
    margin: '-16px -16px -12px',
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
    paddingLeft: 28,
    paddingRight: 28,
  },
  relationship: {
    // color: theme.color.primary,
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 2,
  },
  relationshipName: {
    textTransform: 'capitalize'
  },
  card: {
    marginBottom: theme.spacing(3),
    boxShadow: '0 1px 1px 0 rgba(0, 0, 0, 0.15)',
    overflow: 'initial'
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
    clear: 'both',
    maxWidth: 740,
    width: '100%',
    margin: '0 auto',
  },
}));

const setMemoryCollection = (lock, memory) => {
  const cid = memory.info.collectionId;
  if (cid != null) {
    const cs = lock.collections || [];
    memory.collection = cs.find(c => c.id === cid);
  }
};

const renderCardSubtitle = memory => {
  const time = <TimeWithFormat value={memory.info.date} format="h:mm a DD MMM YYYY" />;
  const hasCol = memory.collection;
  if (!hasCol) return time;

  const { id, name } = memory.collection;
  return (
    <>
      <a href={`/lock/${memory.lockIndex}/collection/${id}`}>{name}</a>
      <span>・</span>
      {time}
    </>
  );
};

function MemoryContent(props) {
  const { memory, setNeedAuth, onMemoryChanged, handleNewCollection, openBlogEditor, myPageRoute, history } = props;
  setMemoryCollection(memory.lock, memory);

  const privateKey = useSelector(state => state.account.privateKey);
  const publicKey = useSelector(state => state.account.publicKey);
  const address = useSelector(state => state.account.address);
  const collections = memory.lock.collections

  const [memoryDecrypted, setMemoryDecrypted] = useState(memory);
  const [decoding, setDecoding] = useState(false);
  const [showComment, setShowComment] = useState(true);
  const [numComment, setNumComment] = useState(0);
  const { enqueueSnackbar } = useSnackbar();
  const [isOpenModal, setOpenModal] = useState(false);
  const [actionMenu, setActionMenu] = useState(null);
  const [isEditOpened, setIsEditOpened] = useState(false);
  const [permLink, setPermLink] = useState();
  const classes = useStyles();
  
  const isEditable = memory.type !== appConstants.memoryTypes.systemGenerated;
  const isMyPost = address === memory.sender

  useEffect(() => {
    let cancel = false;
    const abort = new AbortController();

    async function serialMemory(signal) {
      let mem = memory;
      if (memory.info.blog) {
        const blogData = JSON.parse(memory.content);
        mem = { ...memory };
        mem.meta = blogData.meta;
        const fetchedData = await smartFetchIpfsJson(blogData.blogHash, { signal, timestamp: memory.info.date }).catch(
          err => {
            if (err.name === 'AbortError') return;
            throw err;
          }
        );
        if (fetchedData) {
          mem.blogContent = fetchedData.json;
          // set blog coverPhoto to full path
          if (mem.meta && mem.meta.coverPhoto && mem.meta.coverPhoto.url) {
            mem.meta.coverPhoto.url = ensureHashUrl(mem.meta.coverPhoto.url, fetchedData.gateway);
          }
        }
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
      }

      return mem;
    }

    serialMemory(abort.signal).then(mem => {
      if (cancel || !mem) return;

      setMemoryDecrypted(mem);

      if (memory.showDetail && memory.info.blog) {
        setOpenModal(true);
      }
    });

    return () => {
      abort.abort();
      cancel = true;
    };
  }, [memory, memory.showDetail, memory.info.blog, memory.lock]);

  function FacebookProgress() {
    const classesFb = useStylesFacebook();

    return (
      <div className={classesFb.root}>
        <CircularProgress
          variant="determinate"
          value={100}
          className={classesFb.top}
          size={24}
          thickness={4}
          // {...propsFb}
        />
        <CircularProgress
          variant="indeterminate"
          disableShrink
          className={classes.bottom}
          size={24}
          thickness={4}
          // {...propsFb}
        />
      </div>
    );
  }

  function decodePrivateMemory() {
    setTimeout(() => {
      const obj = { ...memoryDecrypted };
      if (!obj.isUnlock && privateKey && obj.pubkey && (publicKey || obj.r_tags)) {
        setDecoding(true);
        setTimeout(async () => {
          try {
            const isOwner = address === obj.sender;
            // loadMemCacheAPI(obj.id);
            let partnerKey = obj.pubkey; // public key of sender
            if (isOwner) {
              partnerKey = publicKey || obj.r_tags['pub-key'] || obj.s_tags['pub-key'];
            }
            // console.log('partnerKey', partnerKey);
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
            // const message = JSON.stringify(error);
            const message = 'Unlock error, you can not view detail';
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

  function handleNumberComment(number) {
    setNumComment(number);
  }

  const textInput = React.createRef();
  
  function handleShowComment() {
    setShowComment(true);
    setTimeout(() => {
      if (textInput.current) {
        textInput.current.focus();
      }
    }, 100);
  }

  function openMemory(memoryId) {
    setOpenModal(true);
    // console.log('window.location', window.location);
    const pathname = `/blog/${memoryId}`;
    window.history.pushState(null, '', pathname);
    window.trackPageView && window.trackPageView(window.location.pathname);
  }

  function closeMemory() {
    setOpenModal(false);
    const pathname = `/lock/${memory.lockIndex}`;
    window.history.pushState({}, '', pathname);
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
      <>
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
      </>
    );
  };

  function renderLinkUser(isSender) {
    const m = memoryDecrypted
    if (!m) return

    let u, name
    if (isSender) {
      u = m.sender
      name = m.name
    } else {
      u = m.receiver
      name = m.r_tags && m.r_tags['display-name']
    }

    if (!name) return <span>a crush</span>

    return <Link
      href={`/u/${u}`}
      className={classes.relationshipName}
      onClick={e => {
        if (!myPageRoute) {
          e.preventDefault()
          history.push(`/u/${u}`)
        }
      }}>
      {name}
    </Link>
  }

  const renderLockEventMemory = () => {
    return (
      <Typography variant="body2" className={classes.relationship} style={{ whiteSpace: 'pre-line' }} component="div">
        <div>
          <FavoriteIcon color="primary" fontSize="large" />
        </div>
        <span>
          <span>Locked with </span>
          {renderLinkUser(false)}
        </span>
      </Typography>
    );
  };

  const renderJournalCreationMemory = () => {
    return (
      <Typography variant="body2" className={classes.relationship} style={{ whiteSpace: 'pre-line' }} component="div">
        <div>
          <WavesIcon color="primary" fontSize="large" />
        </div>
        <span>
          {renderLinkUser(true)}
          <span> started the journal.</span>
        </span>
      </Typography>
    );
  };

  const renderHelmet = blogInfo => {
    signalPrerenderDone();

    const title = `${blogInfo.title} - A story on Lovelock`;
    const desc = makeLockName(memory.lock);
    let img = blogInfo.coverPhoto && blogInfo.coverPhoto.url;
    if (!img) {
      img = memory.lock.coverImg
        ? process.env.REACT_APP_IPFS + memory.lock.coverImg
        : `${process.env.PUBLIC_URL}/static/img/share.jpg`;
    }
    return (
      <Helmet>
        <title>{title}</title>
        <meta property="og:title" content={title} />
        <meta property="og:type" content="article" />
        <meta name="description" content={desc} />
        <meta property="og:image" content={img} />
        <meta property="og:description" content={desc} />
      </Helmet>
    );
  };

  const renderContentUnlock = () => {
    const isBlog = !!memoryDecrypted.info.blog;
    const blogInfo = memoryDecrypted.meta || {};
    const isJournal = memoryDecrypted.sender === memoryDecrypted.receiver;
    const postContent = memoryDecrypted.content;
    
    return (
      <>
        {memoryDecrypted.type === 1 ? (
          isJournal ? (
            renderJournalCreationMemory()
          ) : (
            renderLockEventMemory()
          )
        ) : (
          <Typography variant="body1" style={{ whiteSpace: 'pre-line', overflowWrap: 'break-word' }} component="div">
            {!isBlog && (
              <UserLinkify content={postContent}>
                <Linkify>{postContent}</Linkify>
              </UserLinkify>
            )}
            {isBlog && blogInfo.title && (
              <BlogShowcase
                classes={classes}
                title={blogInfo.title}
                photo={blogInfo.coverPhoto}
                openHandler={() => openMemory(memory.id)}
              />
            )}
          </Typography>
        )}
        {isOpenModal && blogInfo && blogInfo.title && renderHelmet(blogInfo)}
        {isBlog && (
          <BlogModal
            open={isOpenModal}
            handleClose={closeMemory}
            title={
              <MemoryTitle
                sender={memoryDecrypted.s_tags['display-name']}
                receiver={memoryDecrypted.r_tags['display-name']}
                handleClose={closeMemory}
              />
            }
            subtitle={<TimeWithFormat value={memoryDecrypted.info.date} format="DD MMM YYYY" />}
          >
            <Editor initContent={memoryDecrypted.blogContent} read_only />
            <div className={classes.editorComment}>
              {memoryDecrypted.isUnlock && (
                <MemoryActionButton
                  handleShowComment={handleShowComment}
                  memoryLikes={memory.likes}
                  memoryIndex={memory.id}
                  memoryType={memory.type}
                  isDetailScreen={memory.isDetailScreen}
                  numComment={numComment}
                />
              )}
              {showComment && (
                <MemoryComments
                  handleNumberComment={handleNumberComment}
                  memoryIndex={memory.id}
                  memory={memory}
                  textInput={textInput}
                />
              )}
            </div>
          </BlogModal>
        )}
      </>
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

  const renderActionBt = () => (
    <MemoryActionButton
      handleShowComment={handleShowComment}
      memoryLikes={memory.likes}
      memoryIndex={memory.id}
      memoryType={memory.type}
      isDetailScreen={memory.isDetailScreen}
      numComment={numComment}
    />
  );

  const renderComments = () => (
    <MemoryComments
      handleNumberComment={handleNumberComment}
      memoryIndex={memory.id}
      memory={memory}
      textInput={textInput}
    />
  );

  const { isUnlock } = memoryDecrypted;

  const renderTitleMem = () => {
    const mem = memoryDecrypted
    return (
      <>
        {renderLinkUser(true)}

        {!mem.isDetailScreen && mem.r_tags && mem.r_tags['display-name'] && (
          <>
            <ArrowRightIcon color="primary" />
            {mem.receiver === process.env.REACT_APP_BOT_LOVER ? (
              <p style={{ color: 'inherit' }}>{mem.r_tags['display-name']}</p>
            ) : (
              <a href={`/u/${mem.receiver}`} style={{ color: 'inherit' }} className={classes.memoryReceiver}>
                {mem.r_tags['display-name']}
              </a>
            )}
          </>
        )}
      </>
    );
  };
  
  function openActionMenu(event) {
    setActionMenu(event.currentTarget);
  }
  
  function closeActionMenu() {
    setActionMenu(null);
  }
  
  function openEditPostModal() {
    closeActionMenu();
    setTimeout(() => {
      setIsEditOpened(true);
    }, 0);
  }

  function openEditBlogContent() {
    closeActionMenu();
    setTimeout(() => {
      openBlogEditor(memoryDecrypted)
    }, 0);
  }

  function openPermLinkModal() {
    closeActionMenu();
    const url = `${process.env.PUBLIC_URL || 'https://lovelock.one'}/${memory.info.blog ? 'blog' : 'memory'}/${memory.id}`
    const link = { url }
    if (memory.info.blog) {
      link.title = memoryDecrypted.meta.title
      link.text = link.title
    } else {
      link.text = memory.content
    }

    setTimeout(() => {
      setPermLink(link);
    }, 0);
  }

  function trySharePermLink() {
    // Share API is only supported on modern MOBILE browser and Mac Safari
    navigator.share && navigator.share(permLink)
    .catch(err => {
      if (err.name !== 'AbortError') {
        console.error('Error sharing', err)
        enqueueSnackbar('Error sharing: ' + err.messsage, { variant: 'error' })
      }
    });

    // close the dialog
    setPermLink(null)
  }
  
  return (
    <>
      <Card key={memoryDecrypted.id} data-id={memoryDecrypted.id} className={classes.card}>
        <CardHeader
          avatar={<AvatarPro alt={memoryDecrypted['s_tags']['display-name']} hash={memoryDecrypted['s_tags'].avatar} />}
          title={renderTitleMem()}
          subheader={renderCardSubtitle(memoryDecrypted)}
          action={
            <IconButton aria-label="settings" onClick={openActionMenu}>
              <MoreVertIcon />
            </IconButton>
          }
        />
        
        {isEditable && (
          <Menu
            anchorEl={actionMenu}
            open={Boolean(actionMenu)}
            onClose={closeActionMenu}
            getContentAnchorEl={null}
            anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
            transformOrigin={{ vertical: "top", horizontal: "left" }}
          >
            <MenuItem onClick={openPermLinkModal}>Permanent Link</MenuItem>
            {isMyPost && <MenuItem onClick={openEditPostModal}>{memory.info.blog ? 'Change Blog Info' : 'Edit Memory'}</MenuItem>}
            {isMyPost && memory.info.blog && <MenuItem onClick={openEditBlogContent}>Edit Blog Content</MenuItem>}
          </Menu>
        )}
        
        <CardContent>{isUnlock ? renderContentUnlock() : renderContentLocked()}</CardContent>
        {isUnlock && renderImgUnlock()}
        {isUnlock && renderActionBt()}
        {showComment && renderComments()}
        {isEditOpened && (
          <CommonDialog
            title={memory.info.blog ? 'Change Blog Info' : 'Edit Memory'}
            close={() => setIsEditOpened(false)}
          >
            <CreateMemory
              collectionId={memoryDecrypted.collection ? memoryDecrypted.collection.id : null}
              collections={collections}
              onMemoryChanged={data => {
                setIsEditOpened(false)
                onMemoryChanged && onMemoryChanged(data)
              }}
              handleNewCollection={handleNewCollection}
              memory={memoryDecrypted}
            />
          </CommonDialog>
        )}
        {permLink && (
          <CommonDialog
            title='Permanent Link'
            cancelText={navigator.share ? 'Share' : 'Close'}
            cancel={trySharePermLink}
            okText='Copy'
            confirm={() => {
              copyToClipboard(permLink.url, enqueueSnackbar)
              setPermLink(null)
            }}
            close={() => setPermLink(null)}
          >
            <a className='underline' href={permLink.url}>{permLink.url}</a>
          </CommonDialog>
        )}
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
    </>
  );
}

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
