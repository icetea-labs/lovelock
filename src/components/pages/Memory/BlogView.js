import React, { useState, useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import { withRouter } from 'react-router-dom';

import Editor from './Editor';
import BlogModal from '../../elements/BlogModal';
import MemoryTitle from './MemoryTitle';
import MemoryActionButton from './MemoryActionButton';
import MemoryComments from './MemoryComments';
import { TimeWithFormat, smartFetchIpfsJson } from '../../../helper';
// import { fetchAltFirstIpfsJson } from '../../../helper/utils';
import * as actions from '../../../store/actions';
import APIService from '../../../service/apiService';

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
  const paramMemIndex = parseInt(match.params.hash, 10);
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
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchData() {
    console.log('fetchData blogview', paramMemIndex);
    APIService.getMemoriesByListMemIndex([paramMemIndex]).then(async mems => {
      // console.log('mems', mems);
      const signal = false;
      const mem = mems[0];
      if (mem.info.blog) {
        const blogData = JSON.parse(mem.content);
        mem.blogContent = await smartFetchIpfsJson(blogData.blogHash, { signal, timestamp: mem.info.date })
          .then(d => d.json)
          .catch(err => {
            if (err.name === 'AbortError') return;
            throw err;
          });
      }
      // set to redux
      setBlogView(mem);
      setMemory(mems);
    });
    // setOpenModal(true);
    // setLoading(false);
  }

  function closeMemory() {
    // console.log('window', blogView);
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
      {Object.keys(blogView).length > 0 && (
        <BlogModal
          open
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
