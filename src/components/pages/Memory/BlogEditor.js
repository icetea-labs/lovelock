import React, { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { makeStyles } from '@material-ui/core/styles';

import { saveToIpfs, saveFileToIpfs, sendTxUtil, handleError } from '../../../helper'
import { ensureToken } from '../../../helper/hooks'
import { loadAllDrafts, saveDraft, delDraft } from '../../../helper/draft'
import * as blog from '../../../helper/blog'

import Editor from './Editor'
import BlogModal from '../../elements/BlogModal'
import MemoryTitle from './MemoryTitle'

import Menu from '@material-ui/core/Menu';
import ListItem from '@material-ui/core/ListItem';
import DeleteIcon from '@material-ui/icons/Delete';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import IconButton from '@material-ui/core/IconButton';
import Divider from '@material-ui/core/Divider';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';

import * as actions from '../../../store/actions';

import { useSnackbar } from 'notistack';

const useStyles = makeStyles(theme => ({
    menuItem: {
        width: '100%',
        maxWidth: 480,
    },
    inline: {
        display: 'inline',
    },
}))


// It is ok for blogBody to be at module level
// because we never edit/create 2 blog posts at the same time
// Putting this into component make the Dante2 weird :(
let blogBody = null
let blogTitle = ''
let blogSubtitle = ''
let blogMemory = null
let draftKey = null

function onChangeBlogBody(editor) {
    blogBody = editor.emitSerializedOutput();
}

export default function BlogEditor(props) {

    const { onMemoryChanged, onClose, memory } = props

    const [, updateState] = React.useState();
    const forceUpdate = useCallback(() => updateState({}), []);

    const classes = useStyles();

    if (memory && memory.blogContent && memory !== blogMemory) {
        blogMemory = memory

        const r = blog.split(memory.blogContent)
        blogBody = r.body
        setBlogTitle(r.title)
        setBlogSubtitle(r.subtitle)
    }

    const [previewOn, setPreviewOn] = useState(false)
    const [drafts, setDrafts] = useState()

    const tokenAddress = useSelector(state => state.account.tokenAddress);
    const tokenKey = useSelector(state => state.account.tokenKey);
    const address = useSelector(state => state.account.address);

    const topInfo = useSelector(state => state.loveinfo.topInfo)
    const editMode = memory != null && memory.lockIndex != null
    const senderName = editMode ? memory.s_tags['display-name'] : (topInfo ? topInfo.s_name : '')
    const receiverName = editMode ? memory.r_tags['display-name'] : (topInfo ? topInfo.r_name : '')
    const lockIndex = editMode ? memory.lockIndex : topInfo.index

    const [actionMenu, setActionMenu] = useState(null);

    useEffect(() => {
        loadAllDrafts().then(setDrafts)
    }, [])

    function showDrafts(event) {
      setActionMenu(event.currentTarget);
    }
    
    function hideDrafts() {
      setActionMenu(null);
    }

    const dispatch = useDispatch()

    const { enqueueSnackbar } = useSnackbar();
    const showError = e => enqueueSnackbar(e, { variant: 'error' })

    function setBlogTitle(title) {
        blogTitle = title || ''
        forceUpdate()
    }
    
    function setBlogSubtitle(subtitle) {
        blogSubtitle = subtitle || ''
        forceUpdate()
    }

    function setGLoading(value) {
        dispatch(actions.setLoading(value));
    }

    function sendBlogPost(blogData, opts) {
        const info = { blog: true, hash: [] }
        const content = JSON.stringify(blogData)

        const method = editMode ? 'editMemory' : 'addMemory'
        const params = editMode ? [memory.id, content, null] : [lockIndex, false, content, info]
        return sendTxUtil(method, params, opts)
            .then(r => {
                if (draftKey) {
                    if (drafts && drafts.length) {
                        const dr = drafts.filter(d => d.key !== draftKey)
                        setDrafts(dr)
                    }
                    delDraft(draftKey)
                }
                handleClose()
                onMemoryChanged && onMemoryChanged({ editMode, index: r.returnValue, params });
                return r
            })
            .catch(err => {
                console.error(err)
                const message = handleError(err, 'sending blog post');
                showError(message)
            })
    }

    function handleClose() {
        // Clean up
        blogMemory = null;
        blogBody = null;
        setBlogTitle('');
        setBlogSubtitle('');
        draftKey = null

        // ensure next time open in edit mode & diff draft key
        setPreviewOn(false)

        onClose()
    }

    function handleSubmit() {
        setGLoading(true);
        submitBlog()
            .then(() => {
                setGLoading(false);
            })
            .catch(err => {
                setGLoading(false);
                console.error(err)
                showError(`An error has occured, you can try again later: ${err.message}`);
            });
    }

    function combineContent() {
        return blog.combine(blogBody, blogTitle, blogSubtitle);
    }

    async function submitBlog() {
        const combined = combineContent();
        if (blog.validate(combined)) {
            const uploadThenSendTx = async opts => {
                const blocks = combined.blocks;
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

                const meta = blog.extractMeta(combined);
                // keep old meta if user customized it
                if (editMode && memory.meta) {
                    Object.assign(meta, memory.meta)
                }
                const blogData = {
                    meta,
                    blogHash: submitContent,
                };

                return sendBlogPost(blogData, opts || { address, tokenAddress });
            }

            ensureToken({ tokenKey, dispatch }, uploadThenSendTx)

        } else {
            showError('Please enter memory content.');
        }
    }

    function loadDraft(key, title, subtitle, body) {
        if (draftKey !== key) {
            draftKey = key // this let next draft save to save to the right key
            blogBody = body
            blogSubtitle = subtitle || ''
            blogTitle = title || ''
        }
        hideDrafts()
    }

    function showNotSupport() {
        enqueueSnackbar('This feature is not supported on current version.', { variant: 'info' })
    }

    function renderDrafts() {
        const hasDraft = Boolean(drafts && drafts.length)
        return (
          <Menu
            anchorEl={actionMenu}
            open={Boolean(actionMenu)}
            onClose={hideDrafts}
            getContentAnchorEl={null}
            anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
            transformOrigin={{ vertical: "top", horizontal: "left" }}
          >
              {hasDraft && drafts.map(({key, timestamp, title, subtitle, body}) => (
                <ListItem key={key} button className={classes.menuItem} onClick={() => loadDraft(key, title, subtitle, body)}>
                    <ListItemText 
                        primary={title}
                        secondary={
                            <React.Fragment>
                              <Typography
                                component="span"
                                variant="body2"
                                className={classes.inline}
                                color="textPrimary"
                              >
                                {new Date(timestamp).toLocaleString()}
                              </Typography>
                              {subtitle ? ` — ${subtitle}` : ''}
                            </React.Fragment>
                          }
                         />
                    <ListItemSecondaryAction>
                    <IconButton edge="end" aria-label="delete">
                        <DeleteIcon />
                    </IconButton>
                    </ListItemSecondaryAction>
                </ListItem>
              ))}
            {hasDraft && <Divider />}
            <ListItem onClick={showNotSupport} button className={classes.menuItem}>
              <ListItemText primary="Export" />
            </ListItem>
            <ListItem onClick={showNotSupport} button className={classes.menuItem}>
              <ListItemText primary="Import" />
            </ListItem>
          </Menu>
        )
    }

    async function autoSaveDraft(context, content) {
        if (editMode) return
        const body = await blog.prepareForExport(content)
        if (body) {
            const now = Date.now()
            if (!draftKey) {
                draftKey = 'draft_' + now
            }
            const item = { body, title: blogTitle, subtitle: blogSubtitle, timestamp: now }
            saveDraft(draftKey, item)
                .then(() => {
                    const dr = (drafts || []).reduce((ds, d) => {
                        if (d.key !== draftKey) {
                            ds.push(d)
                        }
                        return ds
                    }, [{ key: draftKey, ...item }])
                    setDrafts(dr)
                })
        }
    }

    return (
        <BlogModal
            open={!!memory}
            handleClose={handleClose}
            handleSubmit={handleSubmit}
            handlePreview={setPreviewOn}
            drafts={{ renderDrafts, showDrafts, hideDrafts }}
            closeText="Cancel"
            title={<MemoryTitle 
                sender={senderName} 
                receiver={receiverName} 
                handleClose={handleClose} />}
        >
            {!previewOn && (
                <Editor
                    initContent={blogBody}
                    title={blogTitle}
                    onTitleChange={setBlogTitle}
                    subtitle={blogSubtitle}
                    onSubtitleChange={setBlogSubtitle}
                    saveOptions={{
                        interval: 1500, // top typing for 1.5 secs
                        save_handler: autoSaveDraft,
                    }}
                    onChange={onChangeBlogBody}
                />
            )}
            {previewOn && <Editor initContent={combineContent()} read_only />}
        </BlogModal>
    )
}