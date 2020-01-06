import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import Skeleton from '@material-ui/lab/Skeleton';

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
}));

function MemoryContainer(props) {
  const { memoryList, proposeInfo, loading, onMemoryChanged, handleNewCollection, openBlogEditor } = props;
  const [memorydata, setMemorydata] = useState([]);
  const arrayLoadin = [{}, {}, {}, {}];
  const [limit, setLimit] = useState(5);
  const [isFetching, setIsFetching] = useInfiniteScroll(fetchMoreListItems);

  const classes = useStyles();
  useEffect(() => {
    let cancel = false;

    async function prepareMemory(_cancel) {
      const newMemoryList = [];

      let hasViewDetail = false;
      for (let i = 0; i < memoryList.length; i++) {
        const obj = memoryList[i];
        if (obj.info.blog && obj.showDetail) hasViewDetail = true;
        newMemoryList.push(obj);
      }
      if (_cancel) return;
      setMemorydata(newMemoryList);

      if (!hasViewDetail) {
        signalPrerenderDone();
      }
    }

    prepareMemory(cancel);

    return () => (cancel = true);
  }, [memoryList]); // eslint-disable-line react-hooks/exhaustive-deps

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

  function fetchMoreListItems() {
    for (let i = 5; i < memorydata.length; i += 5) {
      setIsFetching(false);
      setLimit(limit + 5);
    }
  }

  const renderMemory = () => {
    return memorydata.slice(0, limit).map((memory, index) => {
      return (
        <MemoryContent
          key={index}
          proIndex={memory.id}
          memory={memory}
          propose={proposeInfo}
          onMemoryChanged={onMemoryChanged}
          openBlogEditor={openBlogEditor}
          handleNewCollection={handleNewCollection}
        />
      );
    });
  };

  return <div>{loading ? Loading() : renderMemory()}</div>;
}

const mapStateToProps = state => {
  return {
    proposeInfo: state.loveinfo.topInfo,
    memoryList: state.loveinfo.memories,
    privateKey: state.account.privateKey,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    setMemory: value => {
      dispatch(actions.setMemory(value));
    },
    setNeedAuth(value) {
      dispatch(actions.setNeedAuth(value));
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MemoryContainer);
