import React from 'react';
import styled from 'styled-components';
import './NotFound.scss';
import notFoundImg from '../../../assets/img/404-page-background.jpg';

const NotFoundContainer = styled.div`
  /* The image used */
  background-image: url('/static/img/404PageBackground.jpg');

  /* Full height */
  height: 100%;

  /* Center and scale the image nicely */
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
`;

function NotFound() {
  return (
    <div className=".ot-found ">
      {/* <div className="not-found_img">
        <img src={notFoundImg} alt="tradatech" />
      </div> */}
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
