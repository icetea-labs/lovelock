import React, { useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { saveToIpfs, saveFileToIpfs, sendTxUtil, handleError } from '../../../helper'
import { ensureToken } from '../../../helper/hooks'
import { delDraft } from '../../../helper/draft'
import * as blog from '../../../helper/blog'

import Editor from './Editor'
import BlogModal from '../../elements/BlogModal'
import MemoryTitle from './MemoryTitle'

import * as actions from '../../../store/actions';

const showError = console.error

// It is ok for blogBody to be at module level
// because we never edit/create 2 blog posts at the same time
// Putting this into component make the Dante2 weird :(
let blogBody = null
let blogTitle = ''
let blogSubtitle = ''
let blogMemory = null

function onChangeBlogBody(editor) {
    blogBody = editor.emitSerializedOutput();
}

export default function BlogEditor(props) {

    const { onMemoryChanged, onClose, memory } = props

    const [, updateState] = React.useState();
    const forceUpdate = useCallback(() => updateState({}), []);

    if (memory && memory.blogContent && memory !== blogMemory) {
        blogMemory = memory

        const r = blog.split(memory.blogContent)
        blogBody = r.body
        setBlogTitle(r.title)
        setBlogSubtitle(r.subtitle)
    }

    const [previewOn, setPreviewOn] = useState(false)

    const tokenAddress = useSelector(state => state.account.tokenAddress);
    const tokenKey = useSelector(state => state.account.tokenKey);
    const address = useSelector(state => state.account.address);

    const topInfo = useSelector(state => state.loveinfo.topInfo)

    const dispatch = useDispatch()

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

        const params = [topInfo.index, false, content, info]
        return sendTxUtil('addMemory', params, opts)
            .then(r => {
                handleClose()
                onMemoryChanged && onMemoryChanged({ editMode: false, index: r.returnValue, params });
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
        delDraft();

        // ensure next time open in edit mode
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

    return (
        <BlogModal
            open={!!memory}
            handleClose={handleClose}
            handleSubmit={handleSubmit}
            handlePreview={setPreviewOn}
            closeText="Cancel"
            title={<MemoryTitle sender={topInfo.s_name} receiver={topInfo.r_name} handleClose={handleClose} />}
        >
            {!previewOn && (
                <Editor
                    initContent={blogBody}
                    title={blogTitle}
                    onTitleChange={setBlogTitle}
                    subtitle={blogSubtitle}
                    onSubtitleChange={setBlogSubtitle}
                    saveOptions={{
                        interval: 1500, // save draft everytime user stop typing for 1.5 seconds
                        save_handler: blog.saveDraft,
                    }}
                    onChange={onChangeBlogBody}
                />
            )}
            {previewOn && <Editor initContent={combineContent()} read_only />}
        </BlogModal>
    )
}