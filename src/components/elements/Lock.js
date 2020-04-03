import React from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { makeStyles } from '@material-ui/core/styles';
import CardHeader from '@material-ui/core/CardHeader';
import Skeleton from '@material-ui/lab/Skeleton';

import { AvatarPro } from './AvatarPro';
import Icon from './Icon';

import { getShortName } from '../../helper/utils';

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
  const language = useSelector(state => state.globalData.language);

  const ja = 'ja';

  const getInfo = item => {
    const meOwner = address && (address === item.sender || address === item.receiver);
    const prefix = item.receiver === address ? 's' : 'r';
    const sAlias = '@' + item.s_alias;
    const rAlias = '@' + item.r_alias;

    switch (item.type) {
      case 2: // journal
        return {
          name: item.s_info.lockName
            ? item.s_info.lockName
            : meOwner
            ? 'My Journal'
            : getShortName(item['s_tags']) + ' Journal',
          nick: item.s_info.lockName ? (meOwner ? 'my' : sAlias) + ' journal' : 'by ' + sAlias,
          icon: 'waves',
          avatar: item.coverImg || item.s_tags.avatar,
        };
      case 1: // crush
        return {
          name: item.s_info.lockName
            ? item.s_info.lockName
            : meOwner
            ? item.bot_info['display-name']
            : getShortName(item['s_tags']) + ' & ' + getShortName(item.bot_info),
          nick: (meOwner ? 'my' : sAlias) + ' crush',
          icon: 'done',
          avatar: item.coverImg || item.s_tags.avatar,
        };
      default:
        return {
          name: item.s_info.lockName
            ? item.s_info.lockName
            : meOwner
            ? item[`${prefix}_tags`]['display-name']
            : getShortName(item['s_tags']) + ' & ' + getShortName(item['r_tags']),
          nick: (meOwner ? 'with' : sAlias) + ' ' + rAlias,
          icon: 'done_all',
          avatar: item.coverImg || item[`${prefix}_tags`].avatar,
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
      subheader={loading ? <Skeleton height={6} width="80%" /> : language === ja ? 'なし ' : 'None'}
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
