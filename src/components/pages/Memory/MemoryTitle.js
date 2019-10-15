import React from "react";
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({
	wrapper: {
		margin: '0 20px',
	}
}));

export default function MemoryTitle(props) {
	const classes = useStyles();
  return (
    <>
      {props.sender}
      <img className={classes.wrapper} src="/static/img/logo.svg" width="20"/>
      {props.receiver}
    </>
  )
}