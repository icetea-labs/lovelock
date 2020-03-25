import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import Select from '@material-ui/core/Select';
import InputBase from '@material-ui/core/InputBase';
import { useSnackbar } from 'notistack';
import useMediaQuery from '@material-ui/core/useMediaQuery';

import { ButtonPro } from '../../elements/Button';
import AddInfoMessage from '../../elements/AddInfoMessage';
import * as actions from '../../../store/actions';
import {
  saveBufferToIpfs,
  sendTxUtil,
  handleError,
} from '../../../helper';
import { ensureToken } from '../../../helper/hooks';
import { AvatarPro } from '../../elements';
import UserSuggestionTextarea from "../../elements/Common/UserSuggestionTextarea";
import BlogEditor from './BlogEditor';

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
  &.edit-mode {
    padding: 0;
  }
  @media (max-width: 768px) {
    padding: 16px;
    &.edit-mode {
      padding: 0;
    }
  }
`;
const useStyles = makeStyles(theme => {
  //console.log(theme)
  return {
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
    postTopRow: {
      marginBottom: 6,
      marginTop: -12,
      textAlign: 'right',
      '@media (max-width: 768px)': {
        marginBottom: 12,
        marginTop: 0
      },
    },
    postToLabel: {
      color: theme.palette.primary.light,
      marginRight: theme.spacing(1),
      '@media (min-width: 769px) and (max-width: 900px), (max-width: 600px)': {
        display: 'none'
      },
    }
  }
})

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

export default function CreateMemory(props) {
  const { onMemoryChanged, collectionId, collections, handleNewCollection, memory, openBlogEditor, closeBlogEditor, edittingMemory } = props;
  const classes = useStyles(props);
  const dispatch = useDispatch();
  const layoutRef = React.createRef();

  const editMode = !!memory;
  const editBlogData = memory && memory.info && memory.info.blog && JSON.parse(memory.content)

  const avatar = useSelector(state => state.account.avatar);
  const privateKey = useSelector(state => state.account.privateKey);
  const tokenAddress = useSelector(state => state.account.tokenAddress);
  const tokenKey = useSelector(state => state.account.tokenKey);
  const address = useSelector(state => state.account.address);

  const [filesBuffer, setFilesBuffer] = useState(editBlogData ?
    (editBlogData.meta.coverPhoto && editBlogData.meta.coverPhoto.url ? [editBlogData.meta.coverPhoto.url] : [])
    : (editMode ? memory.info.hash : []));
  const [memoryContent, setMemoryContent] = useState(editBlogData ? editBlogData.meta.title : (editMode ? memory.content : ''));

  const [memoDate, setMemoDate] = useState(editMode ? memory.info.date : new Date());
  const [privacy, setPrivacy] = useState(0);
  const [postCollectionId, setPostCollectionId] = useState(collectionId == null ? '' : collectionId);

  const [proIndex, setProIndex] = useState(props.proIndex);

  const [disableShare, setDisableShare] = useState(true);
  const [grayLayout, setGrayLayout] = useState(false);

  const { enqueueSnackbar } = useSnackbar();
  const showError = e => enqueueSnackbar(e, { variant: 'error' })

  // Is this component display as "compact" version (e.g. on mobile)
  const isCompact = useMediaQuery(theme => theme.breakpoints.down('xs'));
  const componentRef = useRef();

  useEffect(() => {
    if (editMode) return;
    resetValue();
  }, [collectionId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (grayLayout && isCompact) {
      componentRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [grayLayout, isCompact]);

  function setGLoading(value) {
    dispatch(actions.setLoading(value));
  }

  function memoryOnFocus() {
    handleSetGrayLayout();
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
  }
  function handleChangePrivacy(event) {
    setPrivacy(event.target.value);
  }

  function collectionAdded(col) {
    // console.log(col, collections)
    if (collections) {
      const old = collections.find(c => c.id === col.id)
      !old && collections.push(col)
    }
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
    handleSetGrayLayout();
  }

  function onChangeMedia(value) {
    if (value || memoryContent) {
      setDisableShare(false);
    } else {
      setDisableShare(true);
    }
    setFilesBuffer(value);
    handleSetGrayLayout();
  }
  
  function handleSetGrayLayout() {
    if(editMode) return;
    !grayLayout && setGrayLayout(true);
  }

  function mergeEdittingBlogData() {
    if (!editBlogData) return
    Object.assign(editBlogData.meta, { title: memoryContent })
    return editBlogData
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

  function getBlogCoverSize() {
    const img = document.querySelector('.edit-mode .imgContent img.medium-zoom-image')
    return {
      width: img.naturalWidth,
      height: img.naturalHeight
    }
  }

  async function handleShareMemory(blogData, blogTokenOpts) {

    // NOTE: blogData is undefined for regular post, and is an object for blog post

    if (!blogData && !memoryContent && (!filesBuffer || !filesBuffer.length)) {
      return showError('Please enter memory content or add a photo.')
    }

    if (blogData && (!blogData.meta || !blogData.meta.title)) {
      return showError('Blog title cannot be empty.')
    }

    if (privacy) {
      return showError('Private memory is not currently supported.')
    }

    if (proIndex == null || proIndex === '') {
      return showError('Please select a lock to post to.')
    }
    
    const bufferImages = [];
    const srcImages = [];
    
    if (filesBuffer && filesBuffer.length) {

      if (filesBuffer.length > 5) {
        return showError('Choose maximum of 5 photos. Memories deserve the best pictures.')
      }

      const max10M = 1048576 * 10;
      
      for (let i = 0; i < filesBuffer.length; i++) {
        const fileByteLength = filesBuffer[i].byteLength;
        
        // without fileByteLength => it must be an existing image
        // that is, an fully http/https URL or a blob: one
        if (!fileByteLength) {
          // get the hash part and push to srcImages
          const imageParts = (filesBuffer[i].src || filesBuffer[i]).split('/');
          srcImages.push(imageParts.pop());
          continue;
        }
        
        if (fileByteLength > max10M) {
          const message = `Image at ${i + 1} position is over 10MB. Please choose smaller image.`;
          return showError(message);
        }
  
        bufferImages.push(filesBuffer[i]);
      }
    }

    let params = []
    const uploadThenSendTx = async opts => {
      setGLoading(true);
      
      let newImageHashes = [];

      // NOTE: currently, we don't support private message, so comment out 'privacy' stuff
      // for review later

      // if (privacy && !blogData) { // TODO: support private blog
      //   newContent = await encodeWithPublicKey(content, privateKey, publicKey);
      //   newContent = JSON.stringify(newContent);
      //   newImageHashes = await saveBufferToIpfs(bufferImages, { privateKey, publicKey });
      // } else {

        if (bufferImages.length) {
          newImageHashes = await saveBufferToIpfs(bufferImages)
        }

        const info = { hash: [] };
        if (blogData) info.blog = true;

      //}

      let newContent = memoryContent;
      const allImages = newImageHashes ? srcImages.concat(newImageHashes) : srcImages;
  
      if (blogData) {
        // If it is an old image, we do not need to update cover photo
        if (newImageHashes && newImageHashes.length) {
          blogData.meta = blogData.meta || {}
          blogData.meta.coverPhoto = blogData.meta.coverPhoto || {}
          blogData.meta.coverPhoto.url = allImages[0]
          Object.assign(blogData.meta.coverPhoto, getBlogCoverSize())
        } else if (!srcImages.length) {
          delete blogData.meta.coverPhoto
        }
        newContent = JSON.stringify(blogData)
      } else {
        info.hash = allImages
      }
      addMemoTimestamp(info);
      addCollectionId(info);
      
      if (editMode) {
        params = [memory.id, newContent, info];
        return sendTxUtil('editMemory', params, opts || { address, tokenAddress });
      }
  
      params = [proIndex, !!privacy, newContent, info];
      return sendTxUtil('addMemory', params, opts || { address, tokenAddress });
    };

    try {
      const submitPromise = ensureToken(
        {
          tokenKey: privacy ? privateKey : tokenKey,
          dispatch,
        },
        uploadThenSendTx
      )
      const result = await submitPromise
      resetValue();
      onMemoryChanged && onMemoryChanged({ editMode: editMode, index: result.returnValue, params });
    } catch (err) {
      setGLoading(false);
      const message = handleError(err, 'sending memory');
      showError(message);
    }
  }

  function handleChangeLockId(event) {
    const v = event.target.value.trim()
    setProIndex(v.length ? +v : v);
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
    setProIndex(props.proIndex);
  }

  function getPlaceholder() {
    if (editMode) {
      return editBlogData ? 'Enter post title' : 'Enter memory content'
    }

    return grayLayout ? 'Describe your memory' : 'Add a new memory…'
  }

  return (
    <>
      <GrayLayout grayLayout={grayLayout} ref={layoutRef} onClick={clickLayout} />
      <CreatePost grayLayout={grayLayout} ref={componentRef}>
        <ShadowBox className={`${editMode ? 'edit-mode' : ''}`}>
          <Grid container direction="column">
            {grayLayout && props.needSelectLock &&
              <Grid className={classes.postTopRow}>
                <label>
                  <span className={classes.postToLabel}>Post to:</span>
                  <Select
                    native
                    value={proIndex}
                    onChange={handleChangeLockId}
                    classes={{
                      root: `${classes.selectStyle} ${classes.selectStyleMid}`,
                      icon: classes.selectIcon,
                    }}
                    input={<BootstrapInput name="postToLock" id="outlined-collection" />}
                  >
                    <option value="">-- Select lock --</option>
                    {(props.locks || []).map(v => (
                      <option key={v.id} value={v.id}>
                        {v.s_info.lockName || v.s_content}
                      </option>
                    ))}
                  </Select>
                </label>
              </Grid>
            }
            <Grid>
              <Grid container wrap="nowrap" spacing={1}>
                {!editMode && (
                  <Grid item>
                    <AvatarPro alt="img" hash={avatar} className={classes.avatar} />
                  </Grid>
                )}
                <Grid item xs={12}>
                  <UserSuggestionTextarea
                    value={memoryContent}
                    placeholder={getPlaceholder()}
                    onChange={memoryChange}
                    onFocus={memoryOnFocus}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid style={{ paddingTop: grayLayout ? 24 : 0 }}>
              <AddInfoMessage
                hasParentDialog
                photoButtonText={editBlogData ? 'Change Cover' : 'Photo'}
                coverPhotoMode={!!editBlogData}
                files={filesBuffer}
                date={memoDate}
                grayLayout={grayLayout}
                onChangeDate={onChangeDate}
                onChangeMedia={onChangeMedia}
                onBlogClick={editMode ? false : () => {
                  setGrayLayout(false)
                  openBlogEditor()
                }}
              />
            </Grid>
            {(grayLayout || editMode) && (
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
                    <option value={1} disabled>Private</option>
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
                    {(collections || []).map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                    {handleNewCollection && <option value="add">(+) New Collection</option>}
                  </Select>
                  
                </div>
                <ButtonPro
                  type="submit"
                  isGrayout={editMode ? false : disableShare}
                  onClick={() => {
                    handleShareMemory(mergeEdittingBlogData());
                  }}
                  className={classes.btShare}
                >
                  {editMode ? 'Save' : 'Post'}
                </ButtonPro>
              </Grid>
            )}
          </Grid>
        </ShadowBox>

        {address && <BlogEditor
          onMemoryChanged={onMemoryChanged}
          memory={edittingMemory}
          onClose={closeBlogEditor}
          needSelectLock={props.needSelectLock}
          locks={props.locks}
        />}
      </CreatePost>
    </>
  );
}
