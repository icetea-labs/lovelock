import React from 'react';
import { initializeStore } from '../src/store';

const isServer = typeof window === 'undefined';
const __NEXT_REDUX_STORE__ = '__NEXT_REDUX_STORE__';

function getOrCreateStore(initialState) {
  // Always make a new store if server, otherwise state is shared between requests
  if (isServer) {
    return initializeStore(initialState);
  }

  // Create store if unavailable on the client and set it on the window object
  if (!window[__NEXT_REDUX_STORE__]) {
    window[__NEXT_REDUX_STORE__] = initializeStore(initialState);
  }
  return window[__NEXT_REDUX_STORE__];
}

export default App => {
  return class AppWithRedux extends React.Component {
    static async getInitialProps(appContext) {
      // Get or Create the store with `undefined` as initialState
      // This allows you to set a custom default initialState
      const reduxStore = getOrCreateStore();

      // Provide the store to getInitialProps of pages
      appContext.ctx.reduxStore = reduxStore;

      let appProps = {};
      if (typeof App.getInitialProps === 'function') {
        appProps = await App.getInitialProps(appContext);
      }

      return {
        ...appProps,
        initialReduxState: reduxStore.getState(),
      };
    }

    constructor(props) {
      super(props);
      this.reduxStore = getOrCreateStore(props.initialReduxState);
    }

    componentDidMount() {
      const userInfo = this.getSessionStorage();
      const { account } = this.reduxStore.getState();
      if (userInfo && !account.address) {
        this.reduxStore.dispatch({ type: 'account/SET_ACCOUNT', data: userInfo });
      }
    }
    getSessionStorage() {
      const resp = {};
      let user = localStorage.getItem('user');

      if (user && JSON.parse(user).address) {
        user = JSON.parse(user);
        resp.address = user.address;
        resp.privateKey = user.privateKey;
      }
      return resp;
    }

    render() {
      return <App {...this.props} reduxStore={this.reduxStore} />;
    }
  };
};
