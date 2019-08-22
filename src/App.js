import React, { Component } from 'react';
import { connect } from 'react-redux';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { HomeLayout, Layout } from './components/layout/Layout';
import Login from './components/pages/Authen';
// import { NotFound, Exception } from './components/NotFound/NotFound';
import GlobaLoading from './components/elements/GlobaLoading';

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
            <RouteWithLayout layout={HomeLayout} exact path="/" component={Login} />
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
