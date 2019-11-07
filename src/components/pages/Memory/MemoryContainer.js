import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import Skeleton from '@material-ui/lab/Skeleton';
// import { useSnackbar } from 'notistack';

import { getTagsInfo, getJsonFromIpfs, getQueryParam, signalPrerenderDone } from '../../../helper';
import MemoryContent from './MemoryContent';
import * as actions from '../../../store/actions';

const useStyles = makeStyles(theme => ({
  card: {
    marginBottom: theme.spacing(3),
    boxShadow: '0 1px 1px 0 rgba(0, 0, 0, 0.15)',
  },
  media: {
    height: 100,
    position: 'relative',
    overflow: 'hidden',
  },
}));

function MemoryContainer(props) {
  const { memorydata, memoryList, setMemory, proposeInfo } = props;
  const [loading, setLoading] = useState(false);
  // const [memoryList, setMemoryList] = useState([]);
  const arrayLoadin = [{}, {}, {}, {}];
  // const { enqueueSnackbar } = useSnackbar();

  const classes = useStyles();
  useEffect(() => {
    let signal = {};

    async function prepareMemory(signal) {
      const showMemoryId = parseInt(getQueryParam('memory'));
      let newMemoryList = [];
      setLoading(true);

      let tags = memorydata.map(mem => {
        return getTagsInfo(mem.sender);
      });
      tags = await Promise.all(tags);
      if (signal.cancel) return;

      let hasViewDetail = false;
      for (let i = 0; i < memorydata.length; i++) {
        const obj = memorydata[i];
        obj.showDetail = showMemoryId === obj.id;
        if (obj.info.blog && obj.showDetail) hasViewDetail = true;
        obj.name = tags[i]['display-name'];
        obj.pubkey = tags[i]['pub-key'];
        obj.avatar = tags[i].avatar;
        if (obj.receiver !== process.env.REACT_APP_BOT_LOVER) {
          // eslint-disable-next-line no-await-in-loop
          const receiverTags = await getTagsInfo(obj.receiver);
          obj.r_name = receiverTags['display-name'];
        } else if (proposeInfo && [proposeInfo.sender, proposeInfo.receiver].includes(obj.sender)) {
          obj.r_name = proposeInfo.sender === obj.sender ? proposeInfo.r_name : proposeInfo.s_name;
        } else {
          obj.r_name = ''; // a crush name, but let it empty for now
        }
        if (!obj.isPrivate) {
          obj.isUnlock = true;
          for (let j = 0; j < obj.info.hash.length; j++) {
            // eslint-disable-next-line no-await-in-loop
            obj.info.hash[j] = await getJsonFromIpfs(obj.info.hash[j], j);
            if (signal.cancel) return;
          }
        } else {
          // obj.info.hash = [];
          obj.isUnlock = false;
        }

        newMemoryList.push(obj);
      }
      // newMemoryList = newMemoryList.reverse();
      newMemoryList = newMemoryList.sort((a, b) => {
        return b.id - a.id;
      });
      setMemory(newMemoryList);

      setLoading(false);

      if (!hasViewDetail) {
        signalPrerenderDone();
      }
    }

    if (memorydata.length > 0) {
      prepareMemory(signal);
    }

    return () => (signal.cancel = true);
  }, [memorydata]); // eslint-disable-line react-hooks/exhaustive-deps

  if (memoryList.length <= 0 || loading) {
    if (!loading) return <div />;
    return arrayLoadin.map((item, index) => {
      return (
        <Card className={classes.card} key={index}>
          <CardHeader
            avatar={loading ? <Skeleton variant="circle" width={40} height={40} /> : ''}
            title={loading ? <Skeleton height={6} width="80%" /> : ''}
            subheader={loading ? <Skeleton height={6} width="40%" /> : ''}
          />
          <CardContent>
            {loading ? (
              <React.Fragment>
                <Skeleton height={6} />
                <Skeleton height={6} width="80%" />
              </React.Fragment>
            ) : (
              <Typography variant="body2" color="textSecondary" component="p" />
            )}
          </CardContent>
          {loading ? <Skeleton variant="rect" className={classes.media} /> : ''}
        </Card>
      );
    });
  }
  return memoryList.map((memory, index) => {
    return <MemoryContent key={index} proIndex={memory.proIndex} memory={memory} propose={proposeInfo} />;
  });
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
