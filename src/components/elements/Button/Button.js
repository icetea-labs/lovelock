import React from 'react';
import { withStyles, makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import styled from 'styled-components';

export const BaseButton = withStyles({
  root: {
    fontSize: 14,
    lineHeight: 1.5,
    fontFamily: [
      'Montserrat',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(','),
    '&:hover': {
      // backgroundColor: '#0069d9',
      // borderColor: '#0062cc',
    },
    '&:active': {
      // boxShadow: 'none',
      // backgroundColor: '#0062cc',
      // borderColor: '#005cbf',
      // outline: 'none',
    },
    '&:focus': {
      // boxShadow: '0 0 0 0.2rem rgba(0,123,255,.5)',
    },
  },
  label: {
    // textTransform: 'capitalize',
  },
})(Button);

const StyledBtnActive = withStyles({
  root: {
    background: 'linear-gradient(332deg, #b276ff, #fe8dc3)',
    '&:hover': {
      background: 'linear-gradient(332deg, #591ea5, #fe8dc3)',
    },
  },
})(BaseButton);

const StyledBtnInactive = withStyles({
  root: {
    background: '#b2b7bf',
    '&:hover': {
      background: '#848e9c',
    },
  },
})(BaseButton);

const StyledLinkPro = withStyles({
  root: {
    // textTransform: 'none',
  },
})(BaseButton);

const useStyles = makeStyles(theme => ({
  styledButton: {
    margin: theme.spacing(1),
  },
  styledLink: {
    margin: theme.spacing(0),
  },
}));

export function ButtonPro({ children, isGrayout, ...props }) {
  const classes = useStyles();

  return (
    <React.Fragment>
      {isGrayout ? (
        <StyledBtnInactive variant="contained" color="primary" className={classes.styledButton} {...props}>
          {children}
        </StyledBtnInactive>
      ) : (
        <StyledBtnActive variant="contained" color="primary" className={classes.styledButton} {...props}>
          {children}
        </StyledBtnActive>
      )}
    </React.Fragment>
  );
}
// withRouter
// export const LinkPro = withRouter(({ herf, history, ...props }) => {
//   const classes = useStyles();
//   const { children } = props;
//   return (
//     <StyledLinkPro
//       onClick={() => {
//         history.push(herf);
//       }}
//       color="primary"
//       className={classes.styledButton}
//       {...props}
//     >
//       {children}
//     </StyledLinkPro>
//   );
// });

export const LinkPro = ({ children, href, ...props }) => {
  const classes = useStyles();
  return (
    <StyledLinkPro color="primary" className={classes.styledButton} {...props}>
      {children}
    </StyledLinkPro>
  );
};
