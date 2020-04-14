import React from 'react';
import Avatar from '@material-ui/core/Avatar';
import Badge from "@material-ui/core/Badge";
import { withStyles } from "@material-ui/core/styles";

const MainAvatar = withStyles(theme => ({
    root: {
      width: theme.spacing(3.5),
      height: theme.spacing(3.5),
      border: `2px solid ${theme.palette.background.paper}`
    }
  }))(Avatar);
  
  const OtherAvatar = withStyles(theme => ({
    root: {
      width: theme.spacing(3.5),
      height: theme.spacing(3.5),
      marginLeft: theme.spacing(.5),
      marginBottom: theme.spacing(.5),
    }
  }))(Avatar);

  const StyledBadge = withStyles(theme => ({
    root: {
      transform: 'translate(30%, -20%)',
      marginRight: theme.spacing(1),
    }
  }))(Badge);

const SingleAvatar = ({avatar, ...rest}) => {
    return <Avatar src={process.env.REACT_APP_IPFS + avatar} {...rest} />
}

const DualAvatar = ({avatar, avatar2, ...rest}) => {
    return (
      <StyledBadge
        overlap="circle"
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left"
        }}
        badgeContent={
          <MainAvatar
            src={process.env.REACT_APP_IPFS + avatar}
            {...rest}
          />
        }
      >
        <OtherAvatar
          src={process.env.REACT_APP_IPFS + avatar2}
          {...rest}
        />
      </StyledBadge>
    );
  }

const LockAvatar = props => {
    return props.avatar2 ? <DualAvatar {...props} /> : <SingleAvatar {...props} />
}

export { LockAvatar };
export default LockAvatar;
