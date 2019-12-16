import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

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
}));

export default function MemoryTitle(props) {
  const classes = useStyles();
  return (
    <>
      <span className={classes.wrapper} onClick={props.handleClose}>
        {props.sender === props.receiver || !props.receiver ? (
          <>{props.sender && <span>{`${props.sender} 's Journal`}</span>}</>
        ) : (
          <>
            {props.sender}
            <img className={classes.icon} src="/static/img/logo.svg" width="16" alt="LoveLock logo" />
            {props.receiver}
          </>
        )}
      </span>
    </>
  );
}
