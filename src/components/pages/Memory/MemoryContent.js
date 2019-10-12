import React, { useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import { Card, CardHeader, CardContent, IconButton, Typography } from '@material-ui/core';
import Link from '@material-ui/core/Link';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import LockIcon from '@material-ui/icons/Lock';
import CircularProgress from '@material-ui/core/CircularProgress';
import { useSnackbar } from 'notistack';
// import Gallery from 'react-grid-gallery';
import Gallery from 'react-photo-gallery';
import Carousel, { Modal, ModalGateway } from 'react-images';
import FavoriteIcon from '@material-ui/icons/Favorite';

import { TimeWithFormat, decodeWithPublicKey, getJsonFromIpfs } from '../../../helper';
import { AvatarPro } from '../../elements';
import MemoryActionButton from './MemoryActionButton';
import Editor from './Editor';
import SimpleModal from '../../elements/Modal';
import MemoryComments from './MemoryComments';
import MemoryTitle from './MemoryTitle';

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
    backgroundColor: '#fe8dc3',
    color: '#fff',
    padding: '5px 10px',
    borderRadius: 2,
    fontSize: 11,
    boxShadow: '0px 1px 4px 1px #d0d0d0',
  },
  blogTitle: {
    fontSize: 16,
    marginBottom: 16,
    display: 'block',
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

export default function MemoryContent(props) {
  const { memory, proIndex, topInfo } = props;
  const privateKey = useSelector(state => state.account.privateKey);
  const publicKey = useSelector(state => state.account.publicKey);
  const address = useSelector(state => state.account.address);
  const propose = useSelector(state => state.loveinfo.propose);

  const [memoryDecrypted, setMemoryDecrypted] = useState(memory);
  const [memoryContent, setMemoryContent] = useState('');
  const [decoding, setDecoding] = useState(false);
  const [showComment, setShowComment] = useState(true);
  const [numComment, setNumComment] = useState(0);
  const { enqueueSnackbar } = useSnackbar();
  const [isOpenModal, setOpenModal] = useState(false);

  useEffect(() => {
    if (memoryDecrypted.isPrivate) {
      decodePrivateMemory();
    }
  }, [privateKey, proIndex]);

  useEffect(() => {
    setMemoryDecrypted(memory);
    getMemoryContent()
  }, [memory]);

  useEffect(() => {
    if (window.location.search !== '') {
      let url_string = window.location.href
      let url = new URL(url_string)
      if(memory.id == url.searchParams.get("memory")) setOpenModal(true)
    }
  });

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
            let partnerKey = obj.pubkey;
            if (address === obj.sender) {
              partnerKey = publicKey;
            }
            obj.content = await decodeWithPublicKey(JSON.parse(obj.content || '{}'), privateKey, partnerKey);
            obj.info = await decodeWithPublicKey(obj.info, privateKey, partnerKey);
            obj.info = JSON.parse(obj.info);
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

  function decodeEditorMemory() {
    try {
      let content = JSON.parse(memoryContent);
      if (content) {
        return content;
      }
    } catch (e) { }
    return false;
  }

  async function getMemoryContent() {
    try {
      let memoryContent = JSON.parse(memoryDecrypted.content);
      if (memoryContent.ipfsHash) {
        let ipfsHash = memoryContent.ipfsHash
        let data = await fetch(process.env.REACT_APP_IPFS + ipfsHash)
        let content = await data.json()
        setMemoryContent(JSON.stringify(content))
      } else {
        setMemoryContent(memoryDecrypted.content)
      }
    } catch (e) {
      setMemoryContent(memoryDecrypted.content)
    }
  }

  function previewEditorMemory() {
    try {
      let content = JSON.parse(memoryContent)
      if (content) {
        let blocks = content.blocks
        let firstImg = null;
        let firstLine = null;
        for (let i in blocks) {
          if (!firstImg && blocks[i].type === 'image') {
            firstImg = blocks[i].data.url
          }
          if (!firstLine && blocks[i].type !== 'image') {
            firstLine = blocks[i].text
            if (firstLine.length > 200) {
              firstLine = firstLine.slice(0, 200) + '...'
            }
          }
          if (firstImg && firstLine) break
        }
        return (
          <>
            <span className={classes.blogTitle}>Blog</span>
            {firstImg && <img src={firstImg} />}
            {firstLine && <span>{firstLine}</span>}
          </>
        )
      }
    } catch (e) { }
    return memoryContent
  }

  function openMemory(memoryId) {
    setOpenModal(true)
    window.history.pushState({}, '', `?memory=${memoryId}`)
  }

  function closeMemory() {
    setOpenModal(false)
    window.history.pushState({}, '', window.location.pathname)
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
  const classes = useStyles();
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
                    <span>Locked with </span>
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
          )}
          {decodeEditorMemory() && (
            <>
              <Link onClick={() => openMemory(memory.id)} className={classes.seeMore}>
                View
              </Link>
              <SimpleModal
                open={isOpenModal}
                handleClose={closeMemory}
                title={<MemoryTitle sender={topInfo.s_name} receiver={topInfo.r_name} />}
                subtitle={<TimeWithFormat value={memoryDecrypted.info.date} format="h:mm a DD MMM YYYY" />}
              >
                <Editor initContent={decodeEditorMemory()} read_only={true} />
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
              </SimpleModal>
            </>
          )}
        </CardContent>
        <React.Fragment>
          {memoryDecrypted.info.hash && (
            <div style={{ maxHeight: '1500px', overflow: 'hidden' }}>
              <Gallery
                // targetRowHeight={300}
                // containerWidth={600}
                photos={memoryDecrypted.info.hash.slice(0, 5)}
                onClick={openLightbox}
              />
            </div>
          )}
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
          <MemoryComments handerNumberComment={handerNumberComment} memoryIndex={memory.id} memory={memory} numComment={numComment} />
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
    </React.Fragment>
  );
}
