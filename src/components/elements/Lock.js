import React from 'react';
import styled from 'styled-components';
import { makeStyles } from '@material-ui/core/styles';
import CardHeader from '@material-ui/core/CardHeader';
import Skeleton from '@material-ui/lab/Skeleton';

import { AvatarPro } from './AvatarPro';
import Icon from './Icon';

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

function Lock(props) {
  const classes = useStyles();
  const { loading = false, locksData, address } = props;
  const locksByStatus = locksData.filter(item => item.status === props.flag);

  const getInfo = item => {
    const prefix = item.receiver === address ? 's' : 'r';
    switch (item.type) {
      case 2:
        return {
          name: item.s_info.lockName
            ? item.s_info.lockName
            : address === item.sender
            ? 'My Journal'
            : item['s_tags']['display-name'],
          nick: 'journal',
          icon: 'waves',
          avatar: item.s_tags.avatar,
        };
      case 1:
        return {
          name: item.bot_info['display-name'],
          nick: 'crush',
          icon: 'done',
          avatar: item.bot_info.avatar,
        };
      default:
        return {
          name: item[`${prefix}_tags`]['display-name'],
          nick: item[`${prefix}_alias`],
          icon: 'done_all',
          avatar: item[`${prefix}_tags`].avatar,
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
          avatar={<AvatarPro alt={info.name} hash={info.avatar} />}
          title={info.name}
          subheader={info.nick}
        />
      );
    });
  })();

  return <>{locksByStatus.length <= 0 ? layoutLoading : layoutLoaded}</>;
}
export { Lock };
export default Lock;
