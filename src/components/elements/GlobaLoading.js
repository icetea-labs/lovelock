import React from 'react';

function GlobaLoading() {
  return (
    <div id="preloader">
      <div id="loader"></div>
    </div>
  );
}

function SimpleLoading() {
  return (
    <div className="simple-loading"><div /></div>
  );
}

export { GlobaLoading, SimpleLoading };
export default GlobaLoading;
