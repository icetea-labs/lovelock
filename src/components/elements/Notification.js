import React from "react";
import "rc-notification/assets/index.css";
import Notification from "rc-notification";
// import iconSuccess from '/static/img/success.svg';
// import iconWarning from '/static/img/warning.svg';

let notification = null;

Notification.newInstance({}, n => {
  notification || (notification = n);
});

const notifi = {
  info(e) {
    notification.notice({
      content: (
        <span className="notification">
          <img width="20" height="20" src="/static/img/success.svg" alt="" />
          {e}
        </span>
      )
    });
  },
  warn(e) {
    notification.notice({
      duration: 5,
      content: (
        <span className="notification">
          <img width="20" height="20" src="/static/img/warning.svg" alt="" />
          {e}
        </span>
      )
    });
  }
};

export default notifi;
