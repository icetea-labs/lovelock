import React from 'react';
import './NotFound.scss';
import gif from '../../../assets/img/loadingtrada.gif';

function NotFound() {
  return (
    <div>
      <div className="not-found">
        <h3>Not found</h3>
        <p>Sorry! The page you’re looking for cannot be found.</p>
      </div>
      <div className="not-found_img">
        <img src={gif} alt="tradatech" />
      </div>
    </div>
  );
}

function Exception() {
  return (
    <div>
      <div className="not-found exception">
        <p>Oops! We couldn't find what you're looking for.</p>
      </div>
    </div>
  );
}
export { NotFound, Exception };
export default NotFound;
