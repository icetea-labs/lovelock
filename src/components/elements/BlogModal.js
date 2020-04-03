import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import Switch from '@material-ui/core/Switch';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Box from '@material-ui/core/Box';
import { CSSTransition } from 'react-transition-group';
import { FormattedMessage } from 'react-intl';

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
    '@media (max-width: 768px)': {
      padding: '32px 0 80px',
    },
  },
  title: {
    flexGrow: 1,
  },
  wrapper: {
    overflowX: 'hidden',
    overflowY: 'auto',
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
    margin: '0 auto',
  },
  postBody: {
    marginTop: 24, // this is suitable for banner-photo post
  },
  subtitle: {
    fontSize: '0.8em',
    color: theme.palette.text.hint,
  },
  back: {
    margin: theme.spacing(1),
    marginRight: theme.spacing(4),
    color: theme.palette.text.secondary,
    '&:hover': {
      color: theme.palette.text.primary,
    },
  },
}));

export default function BlogModal(props) {
  if (props.open) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = 'auto';
  }

  const classes = useStyles();

  return (
    <CSSTransition in={props.open} timeout={{ enter: 1100, exit: 440 }} classNames="memory-modal" unmountOnExit>
      <div className={classes.wrapper}>
        <div className={classes.paper}>
          <div className={classes.topbar}>
            <AppBar className={classes.appbar}>
              <Toolbar className={classes.toolbar}>
                <div className={classes.title}>
                  {props.needSelectLock && props.selectionLocks && !props.editMode ? (
                    <div className={classes.subtitle}>
                      <FormattedMessage id="memory.postTo" />
                      <Button
                        variant="contained"
                        endIcon={<ArrowDropDownIcon />}
                        onClick={props.selectionLocks.showSelectionLocks}
                        style={{ marginLeft: 16 }}
                      >
                        {props.selectionLocks.selectedLockName()}
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Typography variant="h6">{props.title}</Typography>
                      {props.subtitle && <Typography className={classes.subtitle}>{props.subtitle}</Typography>}
                    </>
                  )}
                </div>
                {props.handlePreview && (
                  <FormControlLabel
                    control={<Switch onChange={e => props.handlePreview(e.target.checked)} />}
                    label={
                      <Typography component="div">
                        <Box color="primary.main">{props.previewText || <FormattedMessage id="memory.publish" />}</Box>
                      </Typography>
                    }
                  />
                )}
                {props.handleSubmit && (
                  <Button variant="contained" color="primary" onClick={props.handleSubmit}>
                    <FormattedMessage id="memory.publish" />
                  </Button>
                )}
                {props.drafts && (
                  <Button
                    variant="contained"
                    endIcon={<ArrowDropDownIcon />}
                    onClick={props.drafts.showDrafts}
                    style={{ marginLeft: 16 }}
                  >
                    <FormattedMessage id="memory.drafts" />
                  </Button>
                )}
                {props.handleClose && (
                  <Button className={classes.back} onClick={props.handleClose}>
                    {props.closeText || <i className="material-icons">close</i>}
                  </Button>
                )}
              </Toolbar>
            </AppBar>
          </div>
          {props.selectionLocks && props.selectionLocks.renderSelectionLocks()}
          {props.drafts && props.drafts.renderDrafts && props.drafts.renderDrafts()}
          <div className={classes.postBody}>{props.children}</div>
        </div>
      </div>
    </CSSTransition>
  );
}
