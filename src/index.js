import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import * as serviceWorker from './serviceWorker';
import { Provider } from 'react-redux';
import { createMuiTheme } from '@material-ui/core/styles';
import { ThemeProvider } from '@material-ui/styles';

import store from './store';

// const defaultTheme = createMuiTheme();
const theme = createMuiTheme({
  palette: {
    primary: {
      light: '#8e8cff',
      main: '#fe8dc3',
      dark: '#48515D',
      contrastText: '#fff',
    },
    secondary: {
      light: '#4da9b7',
      main: '#017a87',
      dark: '#004e5a',
      contrastText: '#000',
    },
  },
  typography: {
    fontSize: 14,
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
    textTransform: 'none',
    button: {
      textTransform: 'none',
    },
  },
  overrides: {
    // Style sheet name ⚛️
    MuiButton: {
      // Name of the rule
      text: {
        // Some CSS
        // background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
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
          transition: 'all .3s ease-in',
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
    label: {
      color: 'red',
    },
  },
});
ReactDOM.render(
  <ThemeProvider theme={theme}>
    <Provider store={store}>
      <App />
    </Provider>
  </ThemeProvider>,
  document.getElementById('root')
);

serviceWorker.unregister();
