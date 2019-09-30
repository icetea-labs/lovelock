import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import Skeleton from '@material-ui/lab/Skeleton';

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
  const { loading, memoryList, proIndex } = props;
  const arrayLoadin = [{}, {}, {}, {}];
  const classes = useStyles();

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
    return <MemoryContent key={index} proIndex={proIndex} memory={memory} />;
  });
}

const mapStateToProps = state => {
  return {
    memoryList: state.loveinfo.memory,
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
