import React from 'react';
import './assets/sass/common.scss';
import { connect } from 'react-redux';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { HomeLayout } from './components/layout/Layout';
import Home from './components/pages/Home';
import { Login, Register } from './components/pages/Authen';
// import { NotFound, Exception } from './components/NotFound/NotFound';
import { GlobaLoading } from './components/elements';
import DetailContainer from './components/pages/Lock/DetailContainer';
import { NotFound, Exception } from './components/pages/NotFound/NotFound';
import ChangeProfile from './components/pages/ChangProfile';
import Explore from './components/pages/Home/Explore';
import BLogView from './components/pages/Memory/BlogView';
import Mypage from './components/pages/MyPage';

function RouteWithLayout({ layout, component, ...rest }) {
  return (
    <Route {...rest} render={props => React.createElement(layout, props, React.createElement(component, props))} />
  );
}

function App(props) {
  const { isLoading } = props;
  return (
    <div className="App">
      <Router>
        <Switch>
          <Route exact path="/login" component={Login} />
          <Route exact path="/register" component={Register} />

          <RouteWithLayout layout={HomeLayout} exact path="/" component={Home} />
          <RouteWithLayout layout={HomeLayout} exact path="/profile" component={ChangeProfile} />
          <RouteWithLayout layout={HomeLayout} exact path="/mypage/:address" component={Mypage} />
          <RouteWithLayout layout={HomeLayout} exact path="/explore" component={Explore} />
          <RouteWithLayout layout={HomeLayout} exact path="/blog/:index" component={BLogView} />
          <RouteWithLayout layout={HomeLayout} exact path="/lock/:index" component={DetailContainer} />
          <RouteWithLayout layout={HomeLayout} exact path="/lock/:index/collection/:cid" component={DetailContainer} />
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
