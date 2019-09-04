import React from 'react';
import { useSelector } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import CardHeader from '@material-ui/core/CardHeader';
import Avatar from '@material-ui/core/Avatar';
import Skeleton from '@material-ui/lab/Skeleton';

const useStyles = makeStyles(theme => ({
  card: {
    padding: theme.spacing(1),
    margin: theme.spacing(1),
    '&:hover': {
      backgroundColor: '#f5f6f7',
    },
  },
}));

export default function LeftProposes(props) {
  const { loading = false } = props;
  const classes = useStyles();

  const propose = useSelector(state => state.loveinfo.propose);
  const pendingPropose = propose.filter(item => item.status === props.flag);
  if (pendingPropose.length <= 0) {
    return (
      <CardHeader
        avatar={
          loading ? (
            <Skeleton variant="circle" width={40} height={40} />
          ) : (
            // <Avatar alt="avata" src="/static/img/user-women.jpg" />
            ''
          )
        }
        title={loading ? <Skeleton height={6} width="80%" /> : ''}
        subheader={loading ? <Skeleton height={6} width="80%" /> : 'Not yet'}
      />
    );
  }

  return pendingPropose.map(item => {
    // console.log('item', item.name); //Not yet
    return (
      <CardHeader
        key={item.id}
        className={classes.card}
        onClick={() => {
          props.handlerSelect(item.id);
        }}
        avatar={<Avatar alt="avata" src="/static/img/user-women.jpg" />}
        title={item.name}
        subheader={item.nick}
      />
    );
  });
}
