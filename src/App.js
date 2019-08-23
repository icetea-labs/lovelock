import React, { Component } from 'react';
import { connect } from 'react-redux';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { HomeLayout, Layout } from './components/layout/Layout';
import Home from './components/pages/Home';
import Login from './components/pages/Authen/Login';
import Register from './components/pages/Authen/Register';
// import { NotFound, Exception } from './components/NotFound/NotFound';
import GlobaLoading from './components/elements/GlobaLoading';
import Timeline from './components/pages/Timeline';

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
            <RouteWithLayout layout={HomeLayout} exact path={`/propose/:proposeIndex`} component={Timeline} />;
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
