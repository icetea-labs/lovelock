import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import Select from '@material-ui/core/Select';
import InputBase from '@material-ui/core/InputBase';
import { useSnackbar } from 'notistack';
import Editor from './Editor';
import BlogModal from '../../elements/BlogModal';

import { ButtonPro } from '../../elements/Button';
import AddInfoMessage from '../../elements/AddInfoMessage';
import * as actions from '../../../store/actions';
import { saveToIpfs, saveFileToIpfs, saveBufferToIpfs, sendTransaction, encodeWithPublicKey } from '../../../helper';
import { AvatarPro } from '../../elements';
import MemoryTitle from './MemoryTitle';
import { getDraft, setDraft, delDraft } from '../../../helper/draft';
import cloneDeep from 'lodash/cloneDeep';

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
    width: 254,
    height: 46,
    borderRadius: 23,
  },
  selectStyle: {
    minWidth: 110,
    height: 36,
    fontSize: 12,
    color: '#8250c8',
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
    paddingBottom: '25px !important',
  },
  blogBtn: {
    color: '#8250c8',
    border: '1px solid #8250c8',
    padding: '10px 18px 11px 18px',
    boxSizing: 'border-box',
    borderRadius: 23,
    height: 36,
    fontSize: 12,
    minWidth: 110,
    marginTop: 5,
    marginLeft: -50,
    outline: 'none',
    cursor: 'pointer',
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
  const { reLoadMemory, proIndex, topInfo } = props;
  const classes = useStyles();
  const dispatch = useDispatch();
  const layoutRef = React.createRef();

  const account = useSelector(state => state.account);
  // const propose = useSelector(state => state.loveinfo.propose);
  const privateKey = useSelector(state => state.account.privateKey);
  const publicKey = useSelector(state => state.account.publicKey);
  const tokenAddress = useSelector(state => state.account.tokenAddress);
  const tokenKey = useSelector(state => state.account.tokenKey);
  const address = useSelector(state => state.account.address);

  const [filesBuffer, setFilesBuffer] = useState([]);
  const [memoryContent, setMemoryContent] = useState('');
  const [grayLayout, setGrayLayout] = useState(false);
  const [memoDate, setMemoDate] = useState(Date.parse(new Date()));
  const [privacy, setPrivacy] = useState(0);
  const [disableShare, setDisableShare] = useState(true);
  const [isOpenModal, setOpenModal] = useState(false);

  const [blogSubtitle, setBlogSubtitle] = useState('');
  const [blogTitle, setBlogTitle] = useState('');
  const [previewOn, setPreviewOn] = useState(false);

  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    resetValue();
  }, [proIndex]);

  function setGLoading(value) {
    dispatch(actions.setLoading(value));
  }

  function setNeedAuth(value) {
    dispatch(actions.setNeedAuth(value));
  }

  function memoryOnFocus() {
    if (!grayLayout) setGrayLayout(true);
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
    setMemoryContent(value);
    //setInitialBlogContent(makeDefaultBlogContent(value))
  }
  function handleChangePrivacy(event) {
    setPrivacy(event.target.value);
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

    for (const i in blocks) {
      if (!firstImg && blocks[i].type === 'image') {
        firstImg = blocks[i].data;
      }
      if (!firstLine) {
        firstLine = blocks[i].text || '';
        if (firstLine.length > 100) {
          firstLine = `${firstLine.slice(0, 100)}…`;
        }
      }
      if (firstImg && firstLine) break;
    }

    return {
      title: firstLine,
      coverPhoto: firstImg
    }
  }

  async function onSubmitEditor() {
    const combined = combineContent();
    const blocks = combined.blocks;
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
          blocks[blockIndex].data.url = process.env.REACT_APP_IPFS + hashes[index];
        });
      }

      let buffer = Buffer.from(JSON.stringify(combined));
      let submitContent = await saveFileToIpfs([buffer]);

      const meta = extractBlogInfo(combined)
      const blogData = JSON.stringify({
        meta,
        blogHash: submitContent
      })
      await handleShareMemory(blogData);

      // Clean up
      blogBody = null;
      setBlogTitle('');
      setBlogSubtitle('');
      delDraft();
    } else {
      let message = 'Please enter memory content.';
      enqueueSnackbar(message, { variant: 'error' });
    }
  }

  function validateEditorContent() {
    let blocks = combineContent().blocks;
    for (let i in blocks) {
      if (blocks[i].text.trim() != '') {
        return true;
      }
    }
    return false;
  }

  function onChangeEditorBody(editor) {
    // check first empty block as a temporary workaround for
    // https://github.com/michelson/dante2/issues/185
    const body = editor.save.editorContent;
    if (body && body.blocks && (body.blocks.length !== 1 || body.blocks[0].text)) {
      blogBody = body;
    }
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

  async function handleShareMemory(blogData) {
    if (!blogData && !memoryContent && !filesBuffer) {
      const message = 'Please enter memory content or add a photo.';
      enqueueSnackbar(message, { variant: 'error' });
      return;
    }

    const content = blogData || memoryContent;

    if (privacy ? !privateKey : !tokenKey) {
      setNeedAuth(true);
      return;
    }

    setGLoading(true);
    setTimeout(async () => {
      // const hash = await saveFilesToIpfs(filesBuffer);
      // const hash = await saveBufferToIpfs(filesBuffer);
      // const info = { date, hash };
      let params = [];
      if (privacy && !blogData) { // TODO: support private blog
        const newContent = await encodeWithPublicKey(content, privateKey, publicKey);
        const hash = await saveBufferToIpfs(filesBuffer, { privateKey, publicKey });
        const newinfo = { date: memoDate, hash };
        params = [proIndex, !!privacy, JSON.stringify(newContent), newinfo];
      } else {
        const hash = blogData && await saveBufferToIpfs(filesBuffer);
        const info = { date: memoDate };
        info.hash = hash || []
        if (blogData) info.blog = true
        params = [proIndex, !!privacy, content, info];
      }
      const result = await sendTransaction('addMemory', params, { address, tokenAddress });
      if (result) {
        reLoadMemory(proIndex);
      }
      resetValue();
    }, 100);
  }

  function resetValue() {
    setMemoryContent('');
    setPrivacy(0);
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
          text: text,
          type: 'unstyled',
        },
      ],
      entityMap: {},
    };
  }

  function urlToBase64(url) {
    return fetch(url)
      .then(r => r.blob())
      .then(blob => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.addEventListener('load', () => {
            resolve(reader.result);
          });
          reader.addEventListener('error', reject);
          reader.readAsDataURL(blob);
        });
      });
  }

  async function saveDraft(context, content) {
    // check first empty block as a temporary workaround for
    // https://github.com/michelson/dante2/issues/185
    if (content.blocks.length !== 1 || content.blocks[0].text) {
      // we need to change image from blob:// to base64

      // cloneDeep raises warning in console
      // should write own clone logic
      const body = cloneDeep(content);
      const blocks = body.blocks;

      const images = blocks.reduce((collector, b, i) => {
        if (b.type === 'image' && b.data.url && b.data.url.indexOf('blob:') === 0) {
          collector[i] = urlToBase64(b.data.url);
        }
        return collector;
      }, {});

      if (Object.keys(images).length) {
        const base64Array = await Promise.all(Object.values(images));
        Object.keys(images).forEach((blockIndex, index) => {
          blocks[blockIndex].data.url = base64Array[index];
        });
      }

      setDraft({
        body,
        title: blogTitle,
        subtitle: blogSubtitle,
      });
    }
  }

  return (
    <React.Fragment>
      <GrayLayout grayLayout={grayLayout} ref={layoutRef} onClick={clickLayout} />
      <CreatePost grayLayout={grayLayout}>
        <ShadowBox>
          <Grid container direction="column" spacing={3}>
            <Grid item>
              <Grid container wrap="nowrap" spacing={1}>
                <Grid item>
                  <AvatarPro alt="img" hash={account.avatar} className={classes.avatar} />
                </Grid>
                <Grid item xs={12}>
                  <BootstrapTextField
                    rows={3}
                    rowsMax={10}
                    fullWidth
                    multiline
                    value={memoryContent}
                    placeholder="Describe your Memory...."
                    onChange={memoryChange}
                    onFocus={memoryOnFocus}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item>
              <AddInfoMessage
                files={filesBuffer}
                date={memoDate}
                grayLayout={grayLayout}
                onChangeDate={onChangeDate}
                onChangeMedia={onChangeMedia}
              />
            </Grid>
            {grayLayout && (
              <Grid item classes={{ root: classes.btBox }}>
                <Select
                  native
                  value={privacy}
                  onChange={handleChangePrivacy}
                  classes={{
                    root: classes.selectStyle,
                    icon: classes.selectIcon,
                  }}
                  input={<BootstrapInput name="privacy" id="outlined-privacy" />}
                >
                  <option value={0}>Public</option>
                  <option value={1}>Private</option>
                </Select>
                <button
                  onClick={() => {
                    setOpenModal(true);
                  }}
                  className={classes.blogBtn}
                >
                  Write blog...
                </button>
                <ButtonPro
                  type="submit"
                  isGrayout={disableShare}
                  onClick={() => {
                    handleShareMemory();
                  }}
                  className={classes.btShare}
                >
                  Share
                </ButtonPro>
              </Grid>
            )}
            <BlogModal
              open={isOpenModal}
              handleClose={closeEditorModal}
              handleSumit={onSubmitEditor}
              handlePreview={onPreviewSwitched}
              closeText="Cancel"
              title={<MemoryTitle sender={topInfo.s_name} receiver={topInfo.r_name} handleClose={closeEditorModal} />}
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
    </React.Fragment>
  );
}
