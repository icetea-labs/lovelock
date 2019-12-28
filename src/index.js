import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
// import MuiThemeProvider from '@material-ui/core/styles/MuiThemeProvider';
import { SnackbarProvider } from 'notistack';
import CloseIcon from '@material-ui/icons/Close';
import IconButton from '@material-ui/core/IconButton';
// import { PersistGate } from 'redux-persist/lib/integration/react';

import { Helmet } from 'react-helmet';
import App from './App';
import * as serviceWorker from './serviceWorker';
// import { GlobaLoading } from './components/elements';
// import { persistor, store } from './store';
import { store } from './store';

import(
  /* webpackChunkName: "tweb3" */
  './service/tweb3'
).then(m => m.ensureContract())

// const defaultTheme = createMuiTheme();
const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#8250c8',
    },
    secondary: {
      main: '#fe8dc3',
    },
  },
  typography: {
    // htmlFontSize: 16,
    fontSize: 12,
    fontFamily: [
      'Montserrat',
      'system-ui',
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
    textTransform: 'none',
    button: {
      textTransform: 'none',
    },
  },
  overrides: {
    MuiSkeleton: {
      animate: {
        animation: 'MuiSkeleton-keyframes-animate 1s ease-in-out infinite',
      },
    },
    // Style sheet name ⚛️
    MuiButton: {
      // Name of the rule
      text: {
        // Some CSS
        // background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
      },
    },
    MuiCardHeader: {
      root: {
        cursor: 'pointer',
      },
      title: {
        textTransform: 'capitalize',
        color: '#8250c8',
        fontWeight: 600,
        fontSize: 14,
        display: 'flex',
      },
      content: {
        color: '#8f8f8f',
      },
    },
    MuiOutlinedInput: {
      root: {
        position: 'relative',
        '& $notchedOutline': {
          borderColor: 'rgba(234, 236, 239, 0.7)',
        },
        '&:hover:not($disabled):not($focused):not($error) $notchedOutline': {
          borderColor: 'rgba(234, 236, 239, 0.7)',
          // Reset on touch devices, it doesn't add specificity
          '@media (hover: none)': {
            borderColor: 'rgba(234, 236, 239, 0.7)',
          },
        },
        '&$focused $notchedOutline': {
          borderWidth: 1,
        },
      },
    },
    MuiInput: {
      focused: {},
      disabled: {},
      error: {},
      underline: {
        borderBottom: 'rgba(234, 236, 239, 0.7)',
        '&:after': {
          borderBottom: `1px solid #fe8dc3`,
          transition: 'all .2s ease-in',
        },
        '&:focused::after': {
          borderBottom: `1px solid rgba(234, 236, 239, 0.7)`,
        },
        '&:before': {
          borderBottom: `1px solid rgba(234, 236, 239, 0.7)`,
        },
        '&:hover:not($disabled):not($focused):not($error):before': {
          borderBottom: '1px solid rgba(234, 236, 239, 0.7)',
        },
        '&:hover:not($disabled):before': {
          borderBottom: '1px solid rgba(234, 236, 239, 0.7)',
        },
        '&$disabled:before': {
          borderBottom: `1px dotted rgba(234, 236, 239, 0.7)`,
        },
      },
    },
  },
});

// add action to all snackbars
const notistackRef = React.createRef();
const onClickDismiss = key => () => {
  notistackRef.current.closeSnackbar(key);
};

ReactDOM.render(
  <MuiThemeProvider theme={theme}>
    <Provider store={store}>
      {/* <PersistGate loading={<GlobaLoading />} persistor={persistor}> */}
      <SnackbarProvider
        ref={notistackRef}
        action={key => (
          <IconButton onClick={onClickDismiss(key)}>
            <CloseIcon />
          </IconButton>
        )}
        preventDuplicate
        autoHideDuration={7000}
        maxSnack={2}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <App />
      </SnackbarProvider>
      {/* </PersistGate> */}
    </Provider>
    <Helmet>
      <title>Lovelock - Cherish Your Intimate Memories</title>
      <meta property="og:title" content="Lovelock - Cherish Your Intimate Memories" />
      <meta property="og:type" content="website" />
      <meta
        name="description"
        content="A safe and peaceful place to store and celebrate your meaningful moments, keep them to yourself or share to close friends."
      />
      <meta property="og:image" content={`${process.env.PUBLIC_URL}/static/img/share.jpg`} />
      <meta
        property="og:description"
        content="A safe and peaceful place to store and celebrate your meaningful moments, keep them to yourself or share to close friends."
      />
    </Helmet>
  </MuiThemeProvider>,
  document.getElementById('root')
);

serviceWorker.unregister();
