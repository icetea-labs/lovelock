import React from "react";

export default function Icon({ type, className, ...rest }) {
  // return <i className={`"material-icons" ${className}`}>{type}</i>;
  return (
    <i
      className={
        className ? "material-icons ".concat(className) : "material-icons"
      }
    >
      {type}
    </i>
  );
}
