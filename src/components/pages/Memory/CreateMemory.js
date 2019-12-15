import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import Select from '@material-ui/core/Select';
import InputBase from '@material-ui/core/InputBase';
import { useSnackbar } from 'notistack';
// import cloneDeep from 'lodash/cloneDeep';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import Editor from './Editor';
import BlogModal from '../../elements/BlogModal';

import { ButtonPro } from '../../elements/Button';
import AddInfoMessage from '../../elements/AddInfoMessage';
import * as actions from '../../../store/actions';
import {
  saveToIpfs,
  saveFileToIpfs,
  saveBufferToIpfs,
  encodeWithPublicKey,
  sendTxUtil,
  handleError,
} from '../../../helper';
import { ensureToken } from '../../../helper/hooks';
import { AvatarPro } from '../../elements';
import MemoryTitle from './MemoryTitle';

// import { getDraft, setDraft, delDraft } from '../../../helper/draft';
import { delDraft } from '../../../helper/draft';

let blogBody = null;

const GrayLayout = styled.div`
  background: ${props => props.grayLayout && 'rgba(0, 0, 0, 0.5)'};
  transition: background 0.3s ease;
  position: ${props => props.grayLayout && 'fixed'};
  top: 0px;
  left: 0px;
  right: 0px;
  bottom: 0px;
  z-index: 1;
`;

const CreatePost = styled.div`
  position: relative;
  top: 0px;
  left: 0px;
  right: 0px;
  bottom: 0px;
  z-index: ${props => props.grayLayout && '2 !important'};
  margin-bottom: 24px;
`;
const ShadowBox = styled.div`
  padding: 30px;
  padding-bottom: 5px;
  border-radius: 5px;
  background: #fff;
  box-shadow: '0 1px 4px 0 rgba(0, 0, 0, 0.15)';
  @media (max-width: 768px) {
    padding: 16px;
  }
`;
const useStyles = makeStyles(theme => ({
  margin: {
    // margin: theme.spacing(1),
  },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 10,
  },
  btShare: {
    width: 232,
    height: 46,
    borderRadius: 23,
    '@media (min-width: 769px) and (max-width: 900px), (max-width: 600px)': {
      width: '100%',
      marginTop: 20,
    },
  },
  selectStyle: {
    minWidth: 110,
    height: 36,
    fontSize: 12,
    color: '#8250c8',
  },
  selectStyleMid: {
    minWidth: 160,
    '@media (min-width: 769px) and (max-width: 900px), (max-width: 600px)': {
      marginLeft: 24,
    },
  },
  selectIcon: {
    width: 24,
    height: 24,
    color: '#8250c8',
    marginRight: theme.spacing(1),
  },
  btBox: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '25px 0 15px',
    '@media (min-width: 769px) and (max-width: 900px), (max-width: 600px)': {
      display: 'block',
      textAlign: 'right',
    },
  },
  rightBtBox: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0',
  },
}));

const BootstrapInput = withStyles(theme => ({
  root: {
    'label + &': {
      marginTop: theme.spacing(3),
    },
  },
  input: {
    borderRadius: 23,
    position: 'relative',
    border: '1px solid #8250c8',
    padding: '10px 18px 11px 18px',
    boxSizing: 'border-box',
    '&:focus': {
      borderRadius: 23,
      borderColor: '#8250c8',
    },
  },
}))(InputBase);

const BootstrapTextField = withStyles(theme => ({
  root: {
    fontSize: 16,
    paddingLeft: theme.spacing(1),
    borderColor: '#8250c8',
    // background: 'red',
  },
}))(InputBase);

export default function CreateMemory(props) {
  const { onMemoryAdded, proIndex, collectionId, collections, handleNewCollection } = props;
  const classes = useStyles(props);
  const dispatch = useDispatch();
  const layoutRef = React.createRef();

  const avatar = useSelector(state => state.account.avatar);
  const rName = useSelector(state => state.account.r_name);
  const sName = useSelector(state => state.account.s_name);
  const privateKey = useSelector(state => state.account.privateKey);
  const publicKey = useSelector(state => state.loveinfo.topInfo.r_publicKey);
  const tokenAddress = useSelector(state => state.account.tokenAddress);
  const tokenKey = useSelector(state => state.account.tokenKey);
  const address = useSelector(state => state.account.address);

  const [filesBuffer, setFilesBuffer] = useState([]);
  const [memoryContent, setMemoryContent] = useState('');
  const [grayLayout, setGrayLayout] = useState(false);

  const [memoDate, setMemoDate] = useState(new Date());
  const [privacy, setPrivacy] = useState(0);
  const [postCollectionId, setPostCollectionId] = useState(collectionId == null ? '' : collectionId);
  const [disableShare, setDisableShare] = useState(true);
  const [isOpenModal, setOpenModal] = useState(false);

  const [blogSubtitle, setBlogSubtitle] = useState('');
  const [blogTitle, setBlogTitle] = useState('');
  const [previewOn, setPreviewOn] = useState(false);

  const { enqueueSnackbar } = useSnackbar();

  // Is this component display as "compact" version (e.g. on mobile)
  const isCompact = useMediaQuery(theme => theme.breakpoints.down('xs'));
  const componentRef = useRef();

  useEffect(() => {
    resetValue();
  }, [proIndex, collectionId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (grayLayout && isCompact) {
      componentRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [grayLayout, isCompact]);

  function setGLoading(value) {
    dispatch(actions.setLoading(value));
  }

  function memoryOnFocus() {
    !grayLayout && setGrayLayout(true);
  }

  function clickLayout(e) {
    if (e.target === layoutRef.current) setGrayLayout(false);
  }
  function memoryChange(e) {
    const { value } = e.target;
    if (value || filesBuffer) {
      setDisableShare(false);
    } else {
      setDisableShare(true);
    }
    setMemoryContent(value.normalize());
    // setInitialBlogContent(makeDefaultBlogContent(value))
  }
  function handleChangePrivacy(event) {
    setPrivacy(event.target.value);
  }

  function collectionAdded(col) {
    setPostCollectionId(col.id);
  }

  function handleChangePostCollectionId(event) {
    const { value } = event.target;
    if (value !== 'add') {
      setPostCollectionId(event.target.value);
    } else {
      setPostCollectionId(postCollectionId);
      if (handleNewCollection) {
        handleNewCollection(collectionAdded);
      }
    }
  }

  function onChangeDate(value) {
    setMemoDate(value);
  }

  function onChangeMedia(value) {
    if (value || memoryContent) {
      setDisableShare(false);
    } else {
      setDisableShare(true);
    }
    setFilesBuffer(value);
  }

  function extractBlogInfo(content) {
    let firstImg;
    let firstLine;

    const { blocks } = content;

    let b;
    for (b of blocks) {
      if (!firstImg) {
        if (b.type === 'image') {
          firstImg = b.data;
        } else if (b.type === 'video') {
          // get the video thumbnail
          const data = b.data && b.data.embed_data;
          if (data) {
            firstImg = {
              width: data.get('width'),
              height: data.get('height'),
              url: data.get('thumbnail_url'),
            };
            if (firstImg.url) {
              firstImg.url = firstImg.url.replace('hqdefault.jpg', 'maxresdefault.jpg');
            }
          }
        }
      }
      if (!firstLine) {
        firstLine = b.text || '';
        if (firstLine.length > 69) {
          firstLine = `${firstLine.slice(0, 69)}…`;
        }
      }
      if (firstImg && firstLine) break;
    }

    return {
      title: firstLine,
      coverPhoto: firstImg && {
        width: firstImg.width,
        height: firstImg.height,
        url: firstImg.url,
      },
    };
  }

  function onSubmitEditor() {
    setGLoading(true);
    submitEditor()
      .then(() => {
        setGLoading(false);
      })
      .catch(err => {
        setGLoading(false);
        const message = `An error has occured, you can try again later: ${err.message}`;
        enqueueSnackbar(message, { variant: 'error' });
      });
  }

  async function submitEditor() {
    const combined = combineContent();
    const { blocks } = combined;
    if (validateEditorContent()) {
      const images = blocks.reduce((collector, b, i) => {
        if (
          b.type === 'image' &&
          b.data.url &&
          (b.data.url.indexOf('blob:') === 0 || b.data.url.indexOf('data:') === 0)
        ) {
          collector[i] = fetch(b.data.url)
            .then(r => r.arrayBuffer())
            .then(Buffer.from);
        }
        return collector;
      }, {});

      if (Object.keys(images).length) {
        const bufs = await Promise.all(Object.values(images));
        const hashes = await saveToIpfs(bufs);
        Object.keys(images).forEach((blockIndex, index) => {
          blocks[blockIndex].data.url = /* process.env.REACT_APP_IPFS + */ hashes[index];
        });
      }

      const buffer = Buffer.from(JSON.stringify(combined));
      const submitContent = await saveFileToIpfs([buffer]);

      const meta = extractBlogInfo(combined);
      const blogData = JSON.stringify({
        meta,
        blogHash: submitContent,
      });
      await handleShareMemory(blogData);

      // Clean up
      blogBody = null;
      setBlogTitle('');
      setBlogSubtitle('');
      delDraft();
    } else {
      const message = 'Please enter memory content.';
      enqueueSnackbar(message, { variant: 'error' });
    }
  }

  function validateEditorContent() {
    const { blocks } = combineContent();
    let i;
    for (i in blocks) {
      if (blocks[i].text.trim() !== '') {
        return true;
      }
    }
    return false;
  }

  // function isNonemptyBlog(body) {
  //   if (!body || !body.blocks || !body.blocks.length) return false
  //   if (body.blocks.length > 1) return true
  //   const b = body.blocks[0]
  //   if (b.text ||
  //     b.type === 'image' ||
  //     b.type === 'video' ||
  //     b.type === 'embed') {
  //       return true
  //     }

  //   return false
  // }

  function onChangeEditorBody(editor) {
    blogBody = editor.emitSerializedOutput();
  }

  function onPreviewSwitched(checked) {
    setPreviewOn(checked);
  }

  function combineContent() {
    if (!blogBody) {
      // generate a empty body
      blogBody = makeDefaultBlogContent('');
    }
    const body = blogBody;

    const title = blogTitle;
    const h1 = title && {
      data: {},
      depth: 0,
      entityRanges: [],
      inlineStyleRanges: [],
      key: 'blok0',
      text: title,
      type: 'header-one',
    };
    const subtitle = blogSubtitle;
    const h3 = subtitle && {
      data: {},
      depth: 0,
      entityRanges: [],
      inlineStyleRanges: [],
      key: 'blok1',
      text: subtitle,
      type: 'header-three',
    };

    if (!h1 && !h3) return body; // nothing to merge

    const combined = { ...body };
    combined.blocks = [...combined.blocks];
    if (h3) combined.blocks.unshift(h3);
    if (h1) combined.blocks.unshift(h1);

    return combined;
  }

  function closeEditorModal() {
    setOpenModal(false);
    setGrayLayout(false);

    // ensure next time open in edit mode
    setPreviewOn(false);
  }

  function addCollectionId(info) {
    const colId = +postCollectionId;
    if (postCollectionId !== '' && typeof colId === 'number' && !isNaN(colId)) {
      info.collectionId = colId;
    }
  }

  function addMemoTimestamp(info) {
    if (memoDate) {
      info.date = memoDate.getTime ? memoDate.getTime() : memoDate;
    }
  }

  async function handleShareMemory(blogData) {
    if (!blogData && !memoryContent && !filesBuffer) {
      const message = 'Please enter memory content or add a photo.';
      enqueueSnackbar(message, { variant: 'error' });
      return;
    }

    for (let i = 0; i < filesBuffer.length; i++) {
      if (filesBuffer[i].byteLength > 2097152) {
        const message = `File in ${i + 1} position is over 2MB. Please choose file under 2MB.`;
        enqueueSnackbar(message, { variant: 'error' });
        return;
      }
    }

    const content = blogData || memoryContent;

    let params = [];
    const uploadThenSendTx = async () => {
      setGLoading(true);

      if (privacy && !blogData) {
        // TODO: support private blog
        const newContent = await encodeWithPublicKey(content, privateKey, publicKey);
        const hash = await saveBufferToIpfs(filesBuffer, { privateKey, publicKey });
        const info = { hash };
        addMemoTimestamp(info);
        addCollectionId(info);
        params = [proIndex, !!privacy, JSON.stringify(newContent), info];
      } else {
        const hash = !blogData && (await saveBufferToIpfs(filesBuffer));
        const info = {};
        info.hash = hash || [];
        addMemoTimestamp(info);
        addCollectionId(info);
        if (blogData) info.blog = true;
        params = [proIndex, !!privacy, content, info];
      }
      return await sendTxUtil('addMemory', params, { address, tokenAddress });
    };

    try {
      const result = await ensureToken(
        {
          tokenKey: privacy ? privateKey : tokenKey,
          dispatch,
        },
        uploadThenSendTx
      );

      onMemoryAdded(result.returnValue, params);
      resetValue();
    } catch (err) {
      setGLoading(false);
      const message = handleError(err, 'sending memory');
      enqueueSnackbar(message, { variant: 'error' });
    }
  }

  function resetValue() {
    setMemoryContent('');
    setPrivacy(0);
    setPostCollectionId(collectionId == null ? '' : collectionId);
    setMemoDate(new Date());
    setGLoading(false);
    setGrayLayout(false);
    setFilesBuffer([]);
    setDisableShare(true);
    setOpenModal(false);
  }

  function makeDefaultBlogContent(text) {
    return {
      blocks: [
        {
          data: {},
          depth: 0,
          entityRanges: [],
          inlineStyleRanges: [],
          key: 'blok2',
          text,
          type: 'unstyled',
        },
      ],
      entityMap: {},
    };
  }

  // function urlToBase64(url) {
  //   return fetch(url)
  //     .then(r => r.blob())
  //     .then(blob => {
  //       return new Promise((resolve, reject) => {
  //         const reader = new FileReader();
  //         reader.addEventListener('load', () => {
  //           resolve(reader.result);
  //         });
  //         reader.addEventListener('error', reject);
  //         reader.readAsDataURL(blob);
  //       });
  //     });
  // }

  // function cloneForIdbSave(content) {
  //   return JSON.parse(JSON.stringify(content))
  // }

  async function saveDraft(context, content) {
    // if (isNonemptyBlog(content)) {
    //   // we need to change image from blob:// to base64
    //   const body = cloneForIdbSave(content);
    //   const blocks = body.blocks;
    //   const images = blocks.reduce((collector, b, i) => {
    //     if (b.type === 'image' && b.data.url && b.data.url.indexOf('blob:') === 0) {
    //       collector[i] = urlToBase64(b.data.url);
    //     }
    //     return collector;
    //   }, {});
    //   if (Object.keys(images).length) {
    //     const base64Array = await Promise.all(Object.values(images));
    //     Object.keys(images).forEach((blockIndex, index) => {
    //       blocks[blockIndex].data.url = base64Array[index];
    //     });
    //   }
    //   setDraft({
    //     body,
    //     title: blogTitle,
    //     subtitle: blogSubtitle,
    //   });
    // }
  }
  return (
    <>
      <GrayLayout grayLayout={grayLayout} ref={layoutRef} onClick={clickLayout} />
      <CreatePost grayLayout={grayLayout} ref={componentRef}>
        <ShadowBox>
          <Grid container direction="column">
            <Grid>
              <Grid container wrap="nowrap" spacing={1}>
                <Grid item>
                  <AvatarPro alt="img" hash={avatar} className={classes.avatar} />
                </Grid>
                <Grid item xs={12}>
                  <BootstrapTextField
                    rows={3}
                    rowsMax={10}
                    fullWidth
                    multiline
                    value={memoryContent}
                    placeholder={grayLayout ? 'Describe your memory' : 'Add a new memory…'}
                    onChange={memoryChange}
                    onFocus={memoryOnFocus}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid style={{ paddingTop: grayLayout ? 24 : 0 }}>
              <AddInfoMessage
                files={filesBuffer}
                date={memoDate}
                grayLayout={grayLayout}
                onChangeDate={onChangeDate}
                onChangeMedia={onChangeMedia}
                onBlogClick={() => {
                  setOpenModal(true);
                }}
              />
            </Grid>
            {grayLayout && (
              <Grid classes={{ root: classes.btBox }}>
                <div className={classes.rightBtBox}>
                  <Select
                    native
                    value={privacy}
                    onChange={handleChangePrivacy}
                    classes={{
                      root: classes.selectStyle,
                      icon: classes.selectIcon,
                    }}
                    style={{ marginRight: '1vw' }}
                    input={<BootstrapInput name="privacy" id="outlined-privacy" />}
                  >
                    <option value={0}>Public</option>
                    <option value={1} disabled>
                      Private
                    </option>
                  </Select>
                  <Select
                    native
                    value={postCollectionId}
                    onChange={handleChangePostCollectionId}
                    classes={{
                      root: `${classes.selectStyle} ${classes.selectStyleMid}`,
                      icon: classes.selectIcon,
                    }}
                    input={<BootstrapInput name="collection" id="outlined-collection" />}
                  >
                    <option value="">(No collection)</option>
                    {collections.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                    <option value="add">(+) New Collection</option>
                  </Select>
                </div>
                <ButtonPro
                  type="submit"
                  isGrayout={disableShare}
                  onClick={() => {
                    handleShareMemory();
                  }}
                  className={classes.btShare}
                >
                  Post
                </ButtonPro>
              </Grid>
            )}
            <BlogModal
              open={isOpenModal}
              handleClose={closeEditorModal}
              handleSumit={onSubmitEditor}
              handlePreview={onPreviewSwitched}
              closeText="Cancel"
              title={<MemoryTitle sender={sName} receiver={rName} handleClose={closeEditorModal} />}
            >
              {!previewOn && (
                <Editor
                  initContent={blogBody || makeDefaultBlogContent(memoryContent)}
                  title={blogTitle}
                  onTitleChange={setBlogTitle}
                  subtitle={blogSubtitle}
                  onSubtitleChange={setBlogSubtitle}
                  saveOptions={{
                    interval: 1500, // save draft everytime user stop typing for 1.5 seconds
                    save_handler: saveDraft,
                  }}
                  onChange={onChangeEditorBody}
                />
              )}
              {previewOn && <Editor initContent={combineContent()} read_only />}
            </BlogModal>
          </Grid>
        </ShadowBox>
      </CreatePost>
    </>
  );
}
