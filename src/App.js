import React from 'react';
import './assets/sass/common.scss';
import { connect } from 'react-redux';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { HomeLayout } from './components/layout/Layout';
import Home from './components/pages/Home';
import { Login, Register } from './components/pages/Authen';
// import { NotFound, Exception } from './components/NotFound/NotFound';
import { GlobaLoading } from './components/elements';
import DetailPropose from './components/pages/Propose/Detail';
import { NotFound, Exception } from './components/pages/NotFound/NotFound';
import ChangeProfile from './components/pages/ChangProfile';
import Explore from './components/pages/Home/Explore';
import { checkDevice } from './helper';

function RouteWithLayout({ layout, component, ...rest }) {
  return (
    <Route {...rest} render={props => React.createElement(layout, props, React.createElement(component, props))} />
  );
}

function App(props) {
  const { isLoading } = props;
  // const checkBrowser = checkDevice.get_browser();
  // console.log('Br', checkBrowser);
  const message =
    'This application is currently not supported on mobile and tablet. Please open the application in a desktop browsers.';
  const oldBrowser =
    'This application requires modern browsers. Please install a recent version of Chrome or FireFox.';
  if (window.screen.width < 966 || checkDevice.isMobile()) {
    return (
      <div>
        <span>{message}</span>
      </div>
    );
  }
  if (!('caches' in window)) {
    return (
      <div>
        <span>{oldBrowser}</span>
      </div>
    );
  }
  
  return (
    <div className="App">
      <Router>
        <Switch>
          <Route exact path="/login" component={Login} />
          <Route exact path="/register" component={Register} />
          <RouteWithLayout layout={HomeLayout} exact path="/profile" component={ChangeProfile} />
          <RouteWithLayout layout={HomeLayout} exact path="/" component={Home} />
          <RouteWithLayout layout={HomeLayout} exact path="/explore" component={Explore} />
          <RouteWithLayout layout={HomeLayout} exact path="/lock/:index" component={DetailPropose} />;
          <RouteWithLayout layout={HomeLayout} exact path="/exception" component={Exception} />
          <Route component={NotFound} />
        </Switch>
      </Router>
      {isLoading && <GlobaLoading />}
    </div>
  );
}

const mapStateToProps = state => {
  return {
    isLoading: state.globalData.isLoading,
    address: state.account.address,
  };
};

export default connect(
  mapStateToProps,
  null
)(App);
