import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { red } from '@material-ui/core/colors';
import Icon from '@material-ui/core/Icon';

// const useStyles = makeStyles(theme => ({
//   root: {
//     display: 'flex',
//     justifyContent: 'center',
//     alignItems: 'flex-end',
//   },
//   icon: {
//     margin: theme.spacing(2),
//   },
//   iconHover: {
//     margin: theme.spacing(2),
//     '&:hover': {
//       color: red[800],
//     },
//   },
// }));

export default function Icons({ type, className, ...rest }) {
  // const classes = useStyles();
  // return <Icon >{type}</Icon>;className={className ? 'material-icons '.concat(className) : 'material-icons'}

  return <Icon>{type}</Icon>;
}
