import React from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { makeStyles } from '@material-ui/core/styles';
import CardHeader from '@material-ui/core/CardHeader';
import Skeleton from '@material-ui/lab/Skeleton';

import { AvatarPro } from '../../../elements';
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

  const proposes = useSelector(state => state.loveinfo.proposes);
  const address = useSelector(state => state.account.address);
  const proFilted = proposes.filter(item => item.status === props.flag);
  const classes = useStyles();
  if (proFilted.length <= 0) {
    return (
      <CardHeader
        avatar={loading ? <Skeleton variant="circle" width={40} height={40} /> : ''}
        title={loading ? <Skeleton height={6} width="80%" /> : ''}
        subheader={loading ? <Skeleton height={6} width="80%" /> : 'None'}
      />
    );
  }
  const getInfo = item => {
    switch (item.type) {
      case 2:
        return {
          name: 'My Journal',
          nick: 'journal',
          icon: 'waves',
        };
      case 1:
        return {
          name: item.name,
          nick: 'crush',
          icon: 'done',
        };
      default:
        return {
          name: item.name,
          nick: item.nick,
          icon: 'done_all',
        };
    }
  };
  // display on following order
  // crush -> journal -> lock
  // if same type, current address = sender display first
  const compare = (p1, p2) => {
    const v1 = Number(String(p1.type || 0) + p1.id);
    const v2 = Number(String(p2.type || 0) + p1.id);
    if (address === p1.sender) return -1;
    return v2 - v1;
  };
  return proFilted.sort(compare).map(item => {
    // console.log('item', item);
    const info = getInfo(item);
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
          props.flag === 0 ? (
            <BoxAction>{address === item.sender ? <Icon type="call_made" /> : <Icon type="call_received" />}</BoxAction>
          ) : (
            <BoxAction>
              <Icon type={info.icon} />
            </BoxAction>
          )
        }
        avatar={<AvatarPro alt={info.name} hash={item.avatar} />}
        title={info.name}
        subheader={info.nick}
      />
    );
  });
}
