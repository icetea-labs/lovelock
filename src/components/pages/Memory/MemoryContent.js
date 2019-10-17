import React, { useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import { Card, CardHeader, CardContent, IconButton, Typography } from '@material-ui/core';
import Link from '@material-ui/core/Link';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import LockIcon from '@material-ui/icons/Lock';
import CircularProgress from '@material-ui/core/CircularProgress';
import { useSnackbar } from 'notistack';
import Gallery from 'react-photo-gallery';
import Carousel, { Modal, ModalGateway } from 'react-images';
import FavoriteIcon from '@material-ui/icons/Favorite';
import { Palette } from 'react-palette';

import { TimeWithFormat, decodeWithPublicKey, callView, getTagsInfo } from '../../../helper';
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
    padding: '0 0 16px',
    cursor: 'pointer',
    '&:hover $blogTitleImg, &:hover $blogFirstLine': {
      color: '#fff',
    },
  },
  blogTitleImg: {
    position: 'absolute',
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

export default function MemoryContent(props) {
  const { memory, proIndex } = props;
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
  const [proposeInfo, setProposeInfo] = useState({});
  const [autoFc, setAutoFc] = useState(false);

  useEffect(() => {
    if (memoryDecrypted.isPrivate) {
      decodePrivateMemory();
    }
  }, [privateKey, proIndex]);

  useEffect(() => {
    setMemoryDecrypted(memory);
    getMemoryContent();
  }, [memory]);

  useEffect(() => {
    if (window.location.search !== '') {
      let url_string = window.location.href;
      let url = new URL(url_string);
      if (memory.id == url.searchParams.get('memory')) setOpenModal(true);
    }
  });

  useEffect(() => {
    (async () => {
      let proposes = await callView('getProposeByIndex', [proIndex]);
      let propose = proposes[0];
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
        let receiverTags = await getTagsInfo(receiver);
        propose.r_name = receiverTags['display-name'];
        propose.r_publicKey = receiverTags['pub-key'] || '';
        propose.r_avatar = receiverTags.avatar;
        propose.r_content = propose.r_content;
      }
      setProposeInfo(propose);
    })();
  }, [proIndex]);

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
    setAutoFc(true);
  }

  function decodeEditorMemory() {
    try {
      let content = JSON.parse(memoryContent);
      if (content) {
        return content;
      }
    } catch (e) {}
    return false;
  }

  async function getMemoryContent() {
    try {
      let memoryContent = JSON.parse(memoryDecrypted.content);
      if (memoryContent.ipfsHash) {
        let ipfsHash = memoryContent.ipfsHash;
        let data = await fetch(process.env.REACT_APP_IPFS + ipfsHash);
        let content = await data.json();
        setMemoryContent(JSON.stringify(content));
      } else {
        setMemoryContent(memoryDecrypted.content);
      }
    } catch (e) {
      setMemoryContent(memoryDecrypted.content);
    }
  }

  function previewEditorMemory() {
    try {
      let content = JSON.parse(memoryContent);
      if (content) {
        let blocks = content.blocks;
        let firstImg = null;
        let firstLine = null;
        for (let i in blocks) {
          if (!firstImg && blocks[i].type === 'image') {
            firstImg = blocks[i].data.url;
          }
          if (!firstLine && blocks[i].type !== 'image') {
            firstLine = blocks[i].text;
            if (firstLine.length > 200) {
              firstLine = firstLine.slice(0, 200) + '…';
            }
          }
          if (firstImg && firstLine) break;
        }

        return (
          <>
            {firstImg && (
              <Palette src={firstImg}>
                {({ data }) => (
                  <span
                    className={classes.blogImgWrp}
                    style={{ backgroundColor: data.darkVibrant }}
                    onClick={() => openMemory(memory.id)}
                  >
                    <span className={classes.blogTitleImg} style={{ backgroundColor: data.vibrant }}>
                      BLOG
                    </span>
                    <img src={firstImg} className={classes.blogImgTimeline} />
                    {firstLine && <span className={classes.blogFirstLine}>{firstLine}</span>}
                  </span>
                )}
              </Palette>
            )}
          </>
        );
      }
    } catch (e) {}
    return memoryContent;
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

              {decodeEditorMemory() && (
                <SimpleModal
                  open={isOpenModal}
                  handleClose={closeMemory}
                  title={
                    <MemoryTitle sender={proposeInfo.s_name} receiver={proposeInfo.r_name} handleClose={closeMemory} />
                  }
                  subtitle={<TimeWithFormat value={memoryDecrypted.info.date} format="h:mm a DD MMM YYYY" />}
                >
                  <Editor initContent={decodeEditorMemory()} read_only={true} />
                  <div className={classes.editorComment}>
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
                      <MemoryComments
                        handerNumberComment={handerNumberComment}
                        memoryIndex={memory.id}
                        memory={memory}
                        autoFc={autoFc}
                      />
                    )}
                  </div>
                </SimpleModal>
              )}
            </React.Fragment>
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
        <MemoryComments
          handerNumberComment={handerNumberComment}
          memoryIndex={memory.id}
          memory={memory}
          numComment={numComment}
          autoFc={autoFc}
        />
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
