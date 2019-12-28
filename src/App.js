import React, { Suspense, lazy } from 'react';
import './assets/sass/common.scss';
import { connect } from 'react-redux';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import GlobaLoading from './components/elements/GlobaLoading';

// import { HomeLayout } from './components/layout/Layout';
const HomeLayout = lazy(() => import(
    /* webpackChunkName: "home_layout" */
    /* webpackPrefetch: true */
  './components/layout/Layout'
));

// import Home from './components/pages/Home';
const Home = lazy(() => import(
  /* webpackChunkName: "home" */
  './components/pages/Home'
));

// import { Login, Register } from './components/pages/Authen';
const Login = lazy(() => import(
  /* webpackChunkName: "login" */
  './components/pages/Authen/Login/Login'
));

const Register = lazy(() => import(
  /* webpackChunkName: "register" */
  './components/pages/Authen/Register/Register'
));

// import DetailContainer from './components/pages/Lock/DetailContainer';
const DetailContainer = lazy(() => import(
  /* webpackChunkName: "detail_container" */
  /* webpackPrefetch: true */
  './components/pages/Lock/DetailContainer'
));

// import { NotFound, Exception } from './components/pages/NotFound/NotFound';
const NotFound = lazy(() => import(
  /* webpackChunkName: "not_found" */
  './components/pages/NotFound/NotFound'
));

// import ChangeProfile from './components/pages/ChangeProfile';
const ChangeProfile = lazy(() => import(
  /* webpackChunkName: "change_profile" */
  './components/pages/ChangeProfile'
));

// import Explore from './components/pages/Home/Explore';
const Explore = lazy(() => import(
  /* webpackChunkName: "explore" */
  './components/pages/Home/Explore'
));

// import BLogView from './components/pages/Memory/BlogView';
const BLogView = lazy(() => import(
  /* webpackChunkName: "blog_view" */
  /* webpackPrefetch: true */
  './components/pages/Memory/BlogView'
));

// import Mypage from './components/pages/MyPage';
const Mypage = lazy(() => import(
  /* webpackChunkName: "my_page" */
  './components/pages/MyPage'
));

function RouteWithLayout({ layout, component, ...rest }) {
  window.trackPageView(rest.location.pathname);
  return (
    <Route {...rest} render={props => React.createElement(layout, props, React.createElement(component, props))} />
  );
}
function RouteWithoutLayout({ component, ...rest }) {
  window.trackPageView(rest.location.pathname);
  return <Route {...rest} render={props => React.createElement(component, props)} />;
}

function App(props) {
  const { isLoading } = props;
  return (
    <div className="App">
      <Router>
        <Suspense fallback={<GlobaLoading />}>
          <Switch>
            <RouteWithoutLayout exact path="/login" component={Login} />
            <RouteWithoutLayout exact path="/register" component={Register} />
            <RouteWithoutLayout exact path="/blog/:index" component={BLogView} />

            <RouteWithLayout layout={HomeLayout} exact path="/" component={Home} />
            <RouteWithLayout layout={HomeLayout} exact path="/profile" component={ChangeProfile} />
            <RouteWithLayout layout={HomeLayout} exact path="/explore" component={Explore} />
            <RouteWithLayout layout={HomeLayout} exact path="/lock/:index" component={DetailContainer} />
            <RouteWithLayout layout={HomeLayout} exact path="/lock/:index/collection/:cid" component={DetailContainer} />
            <RouteWithLayout layout={HomeLayout} exact path="/u/:address" component={Mypage} />
            <RouteWithoutLayout exact path='/notfound' component={NotFound} />
            <RouteWithLayout layout={HomeLayout} exact path="/:address" component={Mypage} />
            <RouteWithoutLayout component={NotFound} />
          </Switch>
        </Suspense>
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
