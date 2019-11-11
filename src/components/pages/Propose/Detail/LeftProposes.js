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
  const classes = useStyles();
  const { loading = false } = props;

  const proposes = useSelector(state => state.loveinfo.proposes);
  const address = useSelector(state => state.account.address);
  const locksByStatus = proposes.filter(item => item.status === props.flag);

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
  // Accepted (flag === 1): journal -> crush -> lock
  // Pending: sent -> received
  const compare = (p1, p2) => {
    if (props.flag === 1) {
      const v1 = String(p1.type || 0) + p2.id;
      const v2 = String(p2.type || 0) + p1.id;
      return v2.localeCompare(v1);
    }
    const f1 = address === p1.sender ? '0' : '1';
    const f2 = address === p2.sender ? '0' : '1';
    const v1 = f1 + p1.id;
    const v2 = f2 + p2.id;
    return v1.localeCompare(v2);
  };
  const layoutLoading = (
    <CardHeader
      avatar={loading ? <Skeleton variant="circle" width={40} height={40} /> : ''}
      title={loading ? <Skeleton height={6} width="80%" /> : ''}
      subheader={loading ? <Skeleton height={6} width="80%" /> : 'None'}
    />
  );
  const layoutLoaded = (() => {
    const isPenddingLock = !!(props.flag === 0);

    return locksByStatus.sort(compare).map(item => {
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
            <BoxAction>
              {isPenddingLock ? (
                <Icon type={address === item.sender ? 'call_made' : 'call_received'} />
              ) : (
                <Icon type={info.icon} />
              )}
            </BoxAction>
          }
          avatar={<AvatarPro alt={info.name} hash={item.avatar} />}
          title={info.name}
          subheader={info.nick}
        />
      );
    });
  })();

  return <React.Fragment>{locksByStatus.length <= 0 ? layoutLoading : layoutLoaded}</React.Fragment>;
}
