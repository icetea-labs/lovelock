import React from 'react';
import { AvatarPro } from './AvatarPro';
import Badge from "@material-ui/core/Badge";
import { withStyles } from "@material-ui/core/styles";

const MainAvatar = withStyles(theme => ({
    root: {
      width: theme.spacing(3.5),
      height: theme.spacing(3.5),
      border: `2px solid ${theme.palette.background.paper}`
    }
  }))(AvatarPro);
  
  const OtherAvatar = withStyles(theme => ({
    root: {
      width: theme.spacing(3.5),
      height: theme.spacing(3.5),
      marginLeft: theme.spacing(.5),
      marginBottom: theme.spacing(.5),
    }
  }))(AvatarPro);

  const StyledBadge = withStyles(theme => ({
    root: {
      transform: 'translate(30%, -20%)',
      marginRight: theme.spacing(1),
    }
  }))(Badge);

const SingleAvatar = ({avatar, ...rest}) => {
    return <AvatarPro hash={avatar} {...rest} />
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
            hash={avatar}
            {...rest}
          />
        }
      >
        <OtherAvatar
          hash={avatar2}
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
