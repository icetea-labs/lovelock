import React from "react";
import "rc-notification/assets/index.css";
import Notification from "rc-notification";
import iconSuccess from "../../assets/img/success-icon.png";
import iconWarning from "../../assets/img/warning-icon.png";

let notification = null;

Notification.newInstance({}, n => {
  notification || (notification = n);
});

const notifi = {
  info(e) {
    notification.notice({
      content: (
        <span className="notification">
          <img width='20' height='20' src={iconSuccess} alt="" />
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
          <img src={iconWarning} alt="" />
          {e}
        </span>
      )
    });
  }
};

export default notifi;
