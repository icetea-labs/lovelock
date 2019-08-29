import React, { Component } from 'react';
import './assets/sass/common.scss';
import { connect } from 'react-redux';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { HomeLayout } from './components/layout/Layout';
import Home from './components/pages/Home';
import { Login, Register } from './components/pages/Authen';
// import { NotFound, Exception } from './components/NotFound/NotFound';
import GlobaLoading from './components/elements/GlobaLoading';
import DetailPropose from './components/pages/Propose/Detail';

function RouteWithLayout({ layout, component, ...rest }) {
  return (
    <Route {...rest} render={props => React.createElement(layout, props, React.createElement(component, props))} />
  );
}
class App extends Component {
  render() {
    const { isLoading } = this.props;
    return (
      <div className="App">
        <Router>
          <Switch>
            <Route exact path="/login" component={Login} />
            <Route exact path="/register" component={Register} />
            <RouteWithLayout layout={HomeLayout} exact path="/" component={Home} />
            <RouteWithLayout layout={HomeLayout} exact path={`/propose/:proposeIndex`} component={DetailPropose} />;
            {/* <Route component={NotFound} /> */}
          </Switch>
        </Router>
        {isLoading && <GlobaLoading />}
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    isLoading: state.globalData.isLoading,
  };
};

export default connect(
  mapStateToProps,
  null
)(App);
