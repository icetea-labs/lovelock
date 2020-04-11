import React from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { makeStyles } from '@material-ui/core/styles';
import CardHeader from '@material-ui/core/CardHeader';
import Skeleton from '@material-ui/lab/Skeleton';

import { LockAvatar } from './LockAvatar';
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
  const language = useSelector(state => state.globalData.language);

  const ja = 'ja';

  const getInfo = item => {
    const meOwner = address && (address === item.sender || address === item.receiver);
    // these 2 following vars only meaningful if meOwner === true
    const [selfTags, otherTags] = item.receiver === address ? ['r_tags', 's_tags'] : ['s_tags', 'r_tags'];
    const sAlias = '@' + item.s_alias;
    const rAlias = '@' + item.r_alias;
    // these 2 following vars only meaningfull when meOwner === true
    // const [selfAlias, otherAlias] = item.receiver === address ? [rAlias, sAlias] : [sAlias, rAlias];

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
          avatar: item.s_tags.avatar,
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
          avatar: item.s_tags.avatar,
          avatar2: item.bot_info.botAva,
        };
      case -1: // user
        return {
          name: item['display-name'],
          nick: '@' + item.username,
          icon: 'account_box',
          avatar: item.avatar
        };
      default: // couple
        return {
          name: item.s_info.lockName
            ? item.s_info.lockName
            : meOwner
            ? item[otherTags]['display-name']
            : getShortName(item['s_tags']) + ' & ' + getShortName(item['r_tags']),
          nick: meOwner ? 'with me' : (sAlias + ' ' + rAlias),
          icon: 'done_all',
          avatar: meOwner ? item[otherTags].avatar : item['s_tags'].avatar,
          avatar2: meOwner ? item[selfTags].avatar : item['r_tags'].avatar,
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
    return locksData.sort(compare).map((item, index) => {
      const info = getInfo(item);
      const isPenddingLock = item.status === 0
      return (
        <CardHeader
          key={index}
          classes={{
            root: classes.root, // class name, e.g. `classes-nesting-root-x`
            title: classes.title,
            subheader: classes.subheader,
          }}
          onClick={() => {
            props.handlerSelect(item.id, undefined, item.username);
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
          avatar={<LockAvatar {...info}  />}
          title={info.name}
          subheader={info.nick}
        />
      );
    });
  })();

  return <>{locksData.length <= 0 ? layoutLoading : layoutLoaded}</>;
}
export { Lock };
export default Lock;
