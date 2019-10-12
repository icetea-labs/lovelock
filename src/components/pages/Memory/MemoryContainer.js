import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import Skeleton from '@material-ui/lab/Skeleton';
import { useSnackbar } from 'notistack';

import { getTagsInfo, getJsonFromIpfs } from '../../../helper';
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
  const { proIndex, memorydata, memoryList, setNeedAuth, setMemory, privateKey, topInfo } = props;
  const [loading, setLoading] = useState(true);
  // const [memoryList, setMemoryList] = useState([]);
  const arrayLoadin = [{}, {}, {}, {}];
  const { enqueueSnackbar } = useSnackbar();

  const classes = useStyles();
  useEffect(() => {
    prepareMemory();
  }, [memorydata]);

  function prepareMemory() {
    let newMemoryList = [];
    setLoading(true);
    // console.log('memorydata', memorydata);
    setTimeout(async () => {
      try {
        for (let i = 0; i < memorydata.length; i++) {
          const obj = memorydata[i];
          if (obj.isPrivate && !privateKey) {
            setNeedAuth(true);
            break;
          }
        }

        let tags = [];
        for (let i = 0; i < memorydata.length; i++) {
          const reps = getTagsInfo(memorydata[i].sender);
          tags.push(reps);
        }
        tags = await Promise.all(tags);

        for (let i = 0; i < memorydata.length; i++) {
          const obj = memorydata[i];
          obj.name = tags[i]['display-name'];
          obj.pubkey = tags[i]['pub-key'];
          obj.avatar = tags[i].avatar;
          if (obj.receiver) {
            // eslint-disable-next-line no-await-in-loop
            const receiverTags = await getTagsInfo(obj.receiver);
            obj.r_name = receiverTags['display-name'];
          }
          for (let j = 0; j < obj.info.hash.length; j++) {
            // eslint-disable-next-line no-await-in-loop
            obj.info.hash[j] = await getJsonFromIpfs(obj.info.hash[j], j);
          }
          newMemoryList.push(obj);
        }

        newMemoryList = newMemoryList.reverse();
        setMemory(newMemoryList);
      } catch (e) {
        const message = 'Load memory error!';
        enqueueSnackbar(message, { variant: 'error' });
      }
      setLoading(false);
    }, 100);
  }

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
  // console.log('memoryList', memoryList);
  return memoryList.map((memory, index) => {
    return <MemoryContent key={index} proIndex={proIndex} memory={memory} topInfo={topInfo} />;
  });
}

const mapStateToProps = state => {
  return {
    memoryList: state.loveinfo.memory,
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
