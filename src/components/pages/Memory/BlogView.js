import React, { useState, useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import { withRouter } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import styled from 'styled-components';

import Editor from './Editor';
import BlogModal from '../../elements/BlogModal';
import MemoryTitle from './MemoryTitle';
import MemoryActionButton from './MemoryActionButton';
import MemoryComments from './MemoryComments';
import { TimeWithFormat, smartFetchIpfsJson, makeLockName, signalPrerenderDone, ensureHashUrl } from '../../../helper';
// import { fetchAltFirstIpfsJson } from '../../../helper/utils';
import * as actions from '../../../store/actions';
import APIService from '../../../service/apiService';

window.prerenderReady = false;

const Copyright = styled.div`
  display: flex;
  line-height: 60px;
  justify-content: center;
  clear: both;
  width: 100%;
  margin: 0 auto;
  margin-top: 70px;
  max-width: 740px;
  border-top: 1px solid #e1e1e1;
  color: rgba(0, 0, 0, 0.54);
  a {
    color: inherit;
    &:hover {
      color: #8250c8;
    }
  }
`;

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    overflow: 'hidden',
    backgroundColor: theme.palette.background.paper,
  },
  editorComment: {
    clear: 'both',
    maxWidth: 740,
    width: '100%',
    margin: '0 auto',
  },
}));
export function BlogView(props) {
  const { match, setMemory, setBlogView, blogView } = props;
  const paramMemIndex = parseInt(match.params.index, 10);
  // const [content, setContent] = useState(null);
  const [showComment, setShowComment] = useState(true);
  const [numComment, setNumComment] = useState(0);
  // const [isOpenModal, setOpenModal] = useState(true);
  // const [loading, setLoading] = useState(true);
  // useEffect(() => {
  //   const abort = new AbortController();

  //   hash &&
  //     fetchAltFirstIpfsJson(hash, { signal: abort.signal })
  //       .then(({ json }) => {
  //         if (!abort.signal.aborted) {
  //           setContent(json);
  //         }
  //       })
  //       .catch(err => {
  //         if (err.name === 'AbortError') return;
  //         throw err;
  //       });

  //   return () => {
  //     abort.abort();
  //   };
  // }, [hash]);
  const classes = useStyles();

  useEffect(() => {
    const abort = new AbortController();

    fetchData(abort.signal);

    return () => {
      abort.abort();
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchData(signal) {
    APIService.getMemoriesByListMemIndex([paramMemIndex]).then(async mems => {
      const mem = mems[0];
      if (mem.info.blog) {
        const blogData = JSON.parse(mem.content);
        mem.meta = blogData.meta;
        const { json, gateway } = await smartFetchIpfsJson(blogData.blogHash, {
          signal,
          timestamp: mem.info.date,
        }).catch(err => {
          if (err.name === 'AbortError') return;
          throw err;
        });
        mem.blogContent = json;

        // set blog coverPhoto to full path
        if (mem.meta && mem.meta.coverPhoto && mem.meta.coverPhoto.url) {
          mem.meta.coverPhoto.url = ensureHashUrl(mem.meta.coverPhoto.url, gateway);
        }

        // save to redux
        setBlogView(mem);
        setMemory(mems);
      } else {
        // not a blog, redirect to lock screen
        closeMemory();
      }
    });
  }

  function closeMemory() {
    // console.log('blogView', blogView);
    props.history.push(`/lock/${blogView.lockIndex}`);
  }

  const textInput = useRef('');
  function handerShowComment() {
    setShowComment(true);
    setTimeout(() => {
      if (textInput.current) {
        textInput.current.focus();
      }
    }, 100);
  }

  function handleNumberComment(number) {
    setNumComment(number);
  }

  const renderHelmet = blogInfo => {
    signalPrerenderDone();
    const blogMeta = blogInfo.meta;

    const title = `${blogMeta.title} - A story on Lovelock`;
    const { sender, receiver } = blogInfo;
    const propose = {
      sender,
      receiver,
      s_name: blogInfo.s_tags['display-name'],
      r_name: blogInfo.r_tags['display-name'],
    };
    const desc = makeLockName(propose);
    let img = blogMeta.coverPhoto && blogMeta.coverPhoto.url;
    if (!img) {
      img = propose.coverImg
        ? process.env.REACT_APP_IPFS + propose.coverImg
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
  return (
    // <div
    //   style={{
    //     backgroundColor: '#fdfdfd',
    //     height: '100vh',
    //     paddingTop: 40,
    //   }}
    // >
    //   {content && <Editor initContent={content} read_only />}
    // </div>
    <>
      {blogView && blogView.meta && blogView.meta.title && renderHelmet(blogView)}
      {Object.keys(blogView).length > 0 && (
        <BlogModal
          open
          handleClose={closeMemory}
          title={
            <MemoryTitle
              sender={blogView.s_tags['display-name']}
              receiver={blogView.r_tags['display-name']}
              handleClose={closeMemory}
            />
          }
          subtitle={<TimeWithFormat value={blogView.info.date} format="DD MMM YYYY" />}
        >
          <Editor initContent={blogView.blogContent} read_only />
          <div className={classes.editorComment}>
            <MemoryActionButton
              handerShowComment={handerShowComment}
              memoryLikes={blogView.likes}
              memoryIndex={blogView.id}
              memoryType={blogView.type}
              isDetailScreen={blogView.isDetailScreen}
              numComment={numComment}
            />
            {showComment && (
              <MemoryComments
                handleNumberComment={handleNumberComment}
                memoryIndex={blogView.id}
                memory={blogView}
                textInput={textInput}
              />
            )}
          </div>
          <Copyright>
            <p>
              Powered by&nbsp;
              <a href="https://icetea.io/" target="_blank" rel="noopener noreferrer">
                Icetea Platform
              </a>
            </p>
          </Copyright>
        </BlogModal>
      )}
    </>
  );
}

// export default props => BlogView({ ...props, });
const mapStateToProps = state => {
  return {
    blogView: state.loveinfo.blogView,
  };
};
const mapDispatchToProps = dispatch => {
  return {
    setBlogView: value => {
      dispatch(actions.setBlogView(value));
    },
    setMemory: value => {
      dispatch(actions.setMemory(value));
    },
  };
};
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(BlogView));
