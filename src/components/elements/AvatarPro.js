import React from 'react';
import Avatar from '@material-ui/core/Avatar';

function AvatarPro({ hash, ...rest }) {
  return (
    <>
      {hash ? (
        <Avatar {...rest} src={process.env.REACT_APP_IPFS + hash} />
      ) : (
        <Avatar {...rest} src={rest.src || '/static/img/no-avatar.jpg'} />
      )}
    </>
  );
}

export { AvatarPro };
export default AvatarPro;
