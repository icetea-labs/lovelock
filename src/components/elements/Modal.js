import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import { CSSTransition } from 'react-transition-group';

const useStyles = makeStyles(theme => ({
  paper: {
    position: 'absolute',
    maxWidth: '100%',
    minHeight: '100vh',
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    boxSizing: 'border-box',
    padding: '32px 3.6% 80px',
    left: 0,
    top: 0,
    width: '100%',
    outline: 'none',
  },
  title: {
    flexGrow: 1,
  },
  wrapper: {
    overflow: 'auto',
    zIndex: '1000',
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  topbar: {
    flexGrow: 1,
  },
  appbar: {
    backgroundColor: 'rgba(255,255,255,.7)',
    boxShadow: 'none',
  },
  toolbar: {
    maxWidth: 1200,
    minHeight: 48,
    width: '100%',
    margin: '0 auto'
  },
  postBody: {
    marginTop: 72,
  },
  subtitle: {
    marginTop: -15,
    marginBottom: 50,
    fontSize: '0.8em',
    opacity: 0.5,
  },
  back: {
    margin: theme.spacing(1),
    marginRight: theme.spacing(4)
  },
}));

export default function SimpleModal(props) {
  if (props.open) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = 'auto';
  }
  
  const classes = useStyles();

  return (
      <CSSTransition in={props.open} timeout={{ enter: 1100, exit: 440 }} classNames='memory-modal' unmountOnExit>
        <div className={classes.wrapper}>
          <div className={classes.paper}>
            <div className={classes.topbar}>
            <AppBar className={classes.appbar}>
            <Toolbar  className={classes.toolbar}>
              <Typography variant="h5" className={classes.title}>{props.title}</Typography>

              {props.handleSumit && (
                  <Button variant="contained" color='primary' onClick={props.handleSumit}>
                    Publish
                  </Button>
                )}
                <Button variant="outlined" className={classes.back} onClick={props.handleClose}>
                  {props.closeText || 'Back'}
                </Button>
            </Toolbar>
            </AppBar>
            </div>
            <div className={classes.postBody}>
              {props.children}
            </div>
          </div>
        </div>
      </CSSTransition>
  );
}
