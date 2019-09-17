import React from 'react';
import Avatar from '@material-ui/core/Avatar';

export default function AvatarPro(props) {
  const { hash, src } = props;
  // hash && delete props.hash;
  return (
    <React.Fragment>
      {src ? (
        <Avatar {...props} />
      ) : (
        <Avatar {...props} src={process.env.REACT_APP_IPFS + (hash || process.env.REACT_APP_AVATAR_DEFAULT)} />
      )}
    </React.Fragment>
  );
}
