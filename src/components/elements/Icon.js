import React from 'react';

export default function Icons({ type, className, ...rest }) {
  return <i className={className ? 'material-icons '.concat(className) : 'material-icons'}>{type}</i>;
}
