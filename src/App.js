import React, { Suspense } from 'react';
import './assets/sass/common.scss';
import lazy from 'react-lazy-with-preload';
import { connect } from 'react-redux';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import { SimpleLoading } from './components/elements/GlobaLoading';
import * as globalData from './store/actions/globalData';

// check display language
const language = (navigator.languages && navigator.languages[0]) || navigator.language || navigator.userLanguage;
const languageWithoutRegionCode = language.toLowerCase().split(/[_-]+/)[0];

// console.log("language", languageWithoutRegionCode)

const LandingPage = lazy(() =>
  import(
    /* webpackChunkName: "landing" */
    './components/layout/LandingPage'
  )
);

// import { HomeLayout } from './components/layout/Layout';
const HomeLayout = lazy(() =>
  import(
    /* webpackChunkName: "home_layout" */
    './components/layout/Layout'
  )
);

// import Home from './components/pages/Home';
const Home = lazy(() =>
  import(
    /* webpackChunkName: "home" */
    './components/pages/Home'
  )
);

// import { Login, Register } from './components/pages/Authen';
const Login = lazy(() =>
  import(
    /* webpackChunkName: "login" */
    './components/pages/Authen/Login/Login'
  )
);

const Register = lazy(() =>
  import(
    /* webpackChunkName: "register" */
    './components/pages/Authen/Register/Register'
  )
);

// import DetailContainer from './components/pages/Lock/DetailContainer';
const DetailContainer = lazy(() =>
  import(
    /* webpackChunkName: "detail_container" */
    './components/pages/Lock/DetailContainer'
  )
);

// import { NotFound, Exception } from './components/pages/NotFound/NotFound';
const NotFound = lazy(() =>
  import(
    /* webpackChunkName: "not_found" */
    './components/pages/NotFound/NotFound'
  )
);

// import ChangeProfile from './components/pages/ChangeProfile';
const ChangeProfile = lazy(() =>
  import(
    /* webpackChunkName: "change_profile" */
    './components/pages/ChangeProfile'
  )
);

// import Explore from './components/pages/Home/Explore';
const Explore = lazy(() =>
  import(
    /* webpackChunkName: "explore" */
    './components/pages/Home/Explore'
  )
);

// import BLogView from './components/pages/Memory/BlogView';
const BLogView = lazy(() =>
  import(
    /* webpackChunkName: "blog_view" */
    './components/pages/Memory/BlogView'
  )
);

// import Mypage from './components/pages/MyPage';
const Mypage = lazy(() =>
  import(
    /* webpackChunkName: "my_page" */
    './components/pages/MyPage'
  )
);

const RegisterIceteaId = lazy(() =>
  import(
    /* webpackChunkName: "register_iceteaid" */
    './components/pages/Authen/Register/RegisterIceteaId'
  )
);

const LoggingAccount = lazy(() =>
  import(
    /* webpackChunkName: "logging_account" */
    './components/pages/Authen/LoggingAccount'
  )
);

const SyncAccount = lazy(() =>
  import(
    /* webpackChunkName: "sync_account" */
    './components/pages/Authen/SyncAccount'
  )
);

const IceteaIdPage = lazy(() =>
  import(
    /* webpackChunkName: "iceteaid_page" */
    './components/pages/Authen/IceteaIdPage'
  )
);

function RouteWithLayout({ layout, component, ...rest }) {
  window.trackPageView && window.trackPageView(rest.location.pathname);
  return (
    <Route {...rest} render={(props) => React.createElement(layout, props, React.createElement(component, props))} />
  );
}

function RouteWithoutLayout({ component, ...rest }) {
  window.trackPageView && window.trackPageView(rest.location.pathname);
  return <Route {...rest} render={(props) => React.createElement(component, props)} />;
}

function RouteHome(props) {
  window.trackPageView && window.trackPageView(props.location.pathname);
  if (!props.hasAddress) {
    const r = <Route {...props} render={(props) => React.createElement(LandingPage, props)} />;
    Register.preload();
    Login.preload();
    return r;
  }

  return (
    <Route {...props} render={(props) => React.createElement(HomeLayout, props, React.createElement(Home, props))} />
  );
}

function App(props) {
  const { isLoading, setLanguage } = props;

  setLanguage(languageWithoutRegionCode);

  return (
    <div className="App">
      <Router>
        <Suspense fallback={<SimpleLoading />}>
          <Switch>
            <RouteWithoutLayout exact path="/login" component={Login} />
            <RouteWithoutLayout exact path="/register" component={Register} />
            <RouteWithoutLayout exact path="/logging" component={LoggingAccount} />
            <RouteWithoutLayout exact path="/registerSuccess" component={RegisterIceteaId} />
            <RouteWithoutLayout exact path="/syncAccount" component={SyncAccount} />
            <RouteWithoutLayout exact path="/blog/:index" component={BLogView} />
            <RouteWithoutLayout exact path="/iceteaId" component={IceteaIdPage} />

            <RouteHome hasAddress={!!props.address} exact path="/" />
            <RouteWithLayout layout={HomeLayout} exact path="/profile" component={ChangeProfile} />
            <RouteWithLayout layout={HomeLayout} exact path="/explore" component={Explore} />
            <RouteWithLayout layout={HomeLayout} exact path="/memory/:index" component={Explore} />
            <RouteWithLayout layout={HomeLayout} exact path="/lock/:index" component={DetailContainer} />
            <RouteWithLayout
              layout={HomeLayout}
              exact
              path="/lock/:index/collection/:cid"
              component={DetailContainer}
            />
            <RouteWithLayout layout={HomeLayout} exact path="/u/:address" component={Mypage} />
            <RouteWithoutLayout exact path="/notfound" component={NotFound} />
            <RouteWithLayout layout={HomeLayout} exact path="/:address" component={Mypage} />
            <RouteWithoutLayout component={NotFound} />
          </Switch>
        </Suspense>
      </Router>
      {isLoading && <SimpleLoading />}
    </div>
  );
}

const mapStateToProps = (state) => {
  return {
    isLoading: state.globalData.isLoading,
    address: state.account.address,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    setLanguage: (value) => {
      dispatch(globalData.setLanguage(value));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
