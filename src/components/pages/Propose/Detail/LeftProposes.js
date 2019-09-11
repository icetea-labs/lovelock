import React from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { makeStyles } from '@material-ui/core/styles';
import CardHeader from '@material-ui/core/CardHeader';
import Avatar from '@material-ui/core/Avatar';
import Skeleton from '@material-ui/lab/Skeleton';
import Icon from '../../../elements/Icon';

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(1),
    margin: theme.spacing(1),
    '&:hover': {
      backgroundColor: '#f5f6f7',
    },
  },
  title: {
    color: '#5a5e67',
  },
  subheader: {
    color: '#8250c8',
  },
  progress: {
    margin: theme.spacing(1),
  },
}));

const BoxAction = styled.div`
  margin: 10px 0;
  i {
    font-size: 16px;
  }
`;

export default function LeftProposes(props) {
  const { loading = false } = props;
  const classes = useStyles();

  const propose = useSelector(state => state.loveinfo.propose);
  const { address } = useSelector(state => state.account);
  const pendingPropose = propose.filter(item => item.status === props.flag);
  if (pendingPropose.length <= 0) {
    return (
      <CardHeader
        avatar={loading ? <Skeleton variant="circle" width={40} height={40} /> : ''}
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
        classes={{
          root: classes.root, // class name, e.g. `classes-nesting-root-x`
          title: classes.title,
          subheader: classes.subheader,
        }}
        onClick={() => {
          props.handlerSelect(item.id);
        }}
        action={
          <BoxAction>{address === item.sender ? <Icon type="call_made" /> : <Icon type="call_received" />}</BoxAction>
        }
        avatar={<Avatar alt="avata" src="/static/img/user-women.jpg" />}
        title={item.name}
        subheader={item.nick}
      />
    );
  });
}
