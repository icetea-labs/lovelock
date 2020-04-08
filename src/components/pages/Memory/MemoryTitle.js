import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { AvatarPro } from '../../elements/index';

const useStyles = makeStyles(theme => ({
  wrapper: {
    cursor: 'pointer',
    color: theme.palette.text.secondary,
    '&:hover': {
      color: theme.palette.text.primary,
    },
  },
  icon: {
    margin: '0 .35em',
  },
  lockcontent: {
    display: 'flex',
    marginTop: 10,
    alignItems: 'center',
  },
  lockcontentText: {
    marginLeft: 10
  }
}));

function LockContentTitle(props) {
  const classes = useStyles();
  return (
    <div className={classes.lockcontent}>
      {props.lock.coverImg && <AvatarPro hash={props.lock.coverImg} />}
      <span className={classes.lockcontentText}>{props.lock.s_info.lockName}</span>
    </div>
  );
}

function NoLockContentTitle(props) {
  const classes = useStyles();
  return (
    <>
      {props.sender === props.receiver || !props.receiver ? (
        <>{props.sender && <span>{`${props.sender} 's Journal`}</span>}</>
      ) : (
        <>
          {props.sender}
          <img className={classes.icon} src="/static/img/logo.svg" width="16" alt="LoveLock logo" />
          {props.receiver}
        </>
      )}
    </>
  );
}

export default function MemoryTitle(props) {
  const classes = useStyles();
  return (
    <>
      <span className={classes.wrapper} onClick={props.handleClose}>
        {props.lock && props.lock.s_info.lockName ? <LockContentTitle {...props} /> : <NoLockContentTitle {...props} />}
      </span>
    </>
  );
}
