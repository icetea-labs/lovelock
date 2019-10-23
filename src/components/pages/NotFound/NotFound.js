import React from 'react';
import './NotFound.scss';
import notFoundImg from '../../../assets/img/404notFound.png';

function NotFound() {
  return (
    <div>
      <div className="not-found_img">
        <img src={notFoundImg} alt="tradatech" />
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
