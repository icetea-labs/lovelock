import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import Skeleton from '@material-ui/lab/Skeleton';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';

import useInfiniteScroll from '../../elements/useInfiniteScroll';

import { signalPrerenderDone } from '../../../helper';
import MemoryContent from './MemoryContent';
import * as actions from '../../../store/actions';

const useStyles = makeStyles(theme => ({
  card: {
    marginBottom: theme.spacing(3),
    boxShadow: '0 1px 1px 0 rgba(0, 0, 0, 0.15)',
  },
  media: {
    height: 60,
    position: 'relative',
    overflow: 'hidden',
  },
  seealso: {
    paddingTop: 32,
    paddingBottom: 24
  },
  divider: {
    marginBottom: 12
  }
}));

function MemoryContainer(props) {
  const { memoryList, loading, onMemoryChanged, handleNewCollection, openBlogEditor, pinIndex, history, nextPage } = props;
  const arrayLoadin = [{}, {}, {}, {}];
  const [/* isFetching */, setIsFetching] = useInfiniteScroll(fetchMoreMemories);

  const classes = useStyles();

  let pinMemory = null
  const memorydata = prepareMemory();
  const showPin = pinMemory != null && !pinMemory.info.blog
  const hasPost = Boolean(memorydata && memorydata.length)

  function prepareMemory() {
    if (!memoryList) {
      return []
    }

    const newMemoryList = [];

    for (let i = 0; i < memoryList.length; i++) {
      const obj = memoryList[i];
      if (obj.id === pinIndex) {
        obj.showDetail = true
        pinMemory = obj
        if (obj.info.blog) {
          newMemoryList.push(obj)
        }
      } else {
        newMemoryList.push(obj)
      }
    }

    if (pinMemory == null || !pinMemory.info.blog) {
      signalPrerenderDone();
    }

    return newMemoryList
  }

  const Loading = () => {
    return arrayLoadin.map((item, index) => {
      return (
        <Card className={classes.card} key={index}>
          <CardHeader
            avatar={<Skeleton variant="circle" width={50} height={50} />}
            title={<Skeleton height={12} width="80%" />}
            subheader={<Skeleton height={12} width="40%" />}
          />
          <CardContent>
            <>
              <Skeleton height={17} />
              <Skeleton height={17} width="80%" />
            </>
          </CardContent>
          <Skeleton variant="rect" className={classes.media} />
        </Card>
      );
    });
  };

  function fetchMoreMemories() {
    setIsFetching(false);
    nextPage();
  }

  const renderMemory = () => {
    return (
      <>
        {showPin && (
          <MemoryContent
            key={0}
            memory={pinMemory}
            onMemoryChanged={onMemoryChanged}
            openBlogEditor={openBlogEditor}
            handleNewCollection={handleNewCollection}
            history={history}
          />
        )}

        {showPin && hasPost && (
          <div className={classes.seealso}>
            <Divider className={classes.divider} />
            <Typography variant="h5">
              See also
            </Typography>
          </div>
        )}

        {memorydata.map((memory, index) => (
          <MemoryContent
            key={index + 1}
            memory={memory}
            onMemoryChanged={onMemoryChanged}
            openBlogEditor={openBlogEditor}
            handleNewCollection={handleNewCollection}
            history={history}
          />
        ))}
      </>
    )
  };

  return <div>{loading ? Loading() : renderMemory()}</div>;
}

const mapStateToProps = state => {
  return {
    memoryList: state.loveinfo.memories,
    privateKey: state.account.privateKey,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    setNeedAuth(value) {
      dispatch(actions.setNeedAuth(value));
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MemoryContainer);
