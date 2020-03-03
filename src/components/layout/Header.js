import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useSelector, useDispatch } from 'react-redux';
import { fade, makeStyles, withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
// import InputBase from '@material-ui/core/InputBase';
// import Badge from '@material-ui/core/Badge';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';
import Button from '@material-ui/core/Button';
import ListItemText from '@material-ui/core/ListItemText';
// import List from '@material-ui/core/List';
// import ListItemAvatar from '@material-ui/core/ListItemAvatar';
// import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Divider from '@material-ui/core/Divider';
import Drawer from '@material-ui/core/Drawer';

import MenuIcon from '@material-ui/icons/Menu';
import AccountCircle from '@material-ui/icons/AccountCircle';
// import GroupIcon from '@material-ui/icons/Group';
// import NotificationsIcon from '@material-ui/icons/Notifications';
import ExploreIcon from '@material-ui/icons/Explore';
import MoreIcon from '@material-ui/icons/MoreVert';
import PersonIcon from '@material-ui/icons/Person';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import AddIcon from '@material-ui/icons/Add';
import VpnKeyIcon from '@material-ui/icons/VpnKey';

import { Link, withRouter } from 'react-router-dom';
import { rem } from '../elements/StyledUtils';
import { AvatarPro } from '../elements';
import PuNewLock from '../elements/PuNewLock';
import PasswordPrompt from './PasswordPrompt';
import ShowMnemonic from './ShowMnemonic';
import * as actions from '../../store/actions';
import { getAuthenAndTags } from '../../helper';
import LeftContainer from '../pages/Lock/LeftContainer';
// import LandingPage from './LandingPage';

const StyledLogo = styled(Link)`
  font-size: ${rem(20)};
  display: flex;
  flex-grow: 1;
  align-items: center;
  text-decoration: none;
  :hover {
    text-decoration: none;
  }
  color: inherit;
  span {
    margin: 0 ${rem(10)};
  }
  cursor: pointer;
`;

const StyledAppBar = withStyles(() => ({
  root: {
    background: '#8250c8',
    // background: 'linear-gradient(340deg, #b276ff, #fe8dc3)',
    color: 'white',
    height: 81,
    padding: '0',
    boxShadow: 'none',
    alignItems: 'center',
    // [theme.breakpoints.up('sm')]: {
    //   background: 'linear-gradient(340deg, #b276ff, #fe8dc3)',
    // },
  },
}))(AppBar);
const StyledToolbar = withStyles({
  root: {
    width: '100%',
    maxWidth: 960,
    height: '100%',
    padding: '0',
    flexGrow: 1,
  },
})(Toolbar);

const useStyles = makeStyles(theme => ({
  grow: {
    flexGrow: 1,
  },
  AppBar: {
    [theme.breakpoints.up('md')]: {
      // background: 'linear-gradient(340deg, #b276ff, #fe8dc3)',
    },
  },
  jsxAvatar: {
    width: 40,
    height: 40,
    marginRight: 10,
    backgroundColor: '#fff',
  },
  friReqTitle: {
    width: 111,
    height: 18,
    marginLeft: theme.spacing(2),
    color: '#373737',
  },
  friReqSetting: {
    width: 46,
    height: 15,
    fontSize: 12,
    marginRight: theme.spacing(2),
    color: '#8250c8',
  },
  friReqConfirm: {
    color: '#8250c8',
    marginRight: theme.spacing(2),
  },
  friReqName: {
    width: 135,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    margin: theme.spacing(1),
  },
  listNoti: {
    maxWidth: 330,
    padding: theme.spacing(0),
    backgroundColor: theme.palette.background.paper,
  },
  listItemNotiStyle: {
    borderRadius: 10,
    margin: theme.spacing(1),
  },
  notiPromise: {
    width: '100%',
    display: 'block',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  expandMore: {
    color: '#fff',
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    display: 'none',
    color: '#fff',
    [theme.breakpoints.up('sm')]: {
      display: 'block',
      minWidth: 50,
      // margin: theme.spacing(0, 3, 0, 0),
      textTransform: 'capitalize',
    },
  },
  search: {
    position: 'relative',
    borderRadius: 36,
    backgroundColor: fade(theme.palette.common.white, 1),
    '&:hover': {
      backgroundColor: fade(theme.palette.common.white, 0.95),
    },
    marginRight: theme.spacing(2),
    marginLeft: 0,
    width: '100%',
    height: 36,
    [theme.breakpoints.up('sm')]: {
      marginLeft: theme.spacing(3),
      width: 'auto',
    },
  },
  searchIcon: {
    width: theme.spacing(7),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#5a5e67',
  },
  inputRoot: {
    // background: '#fff',
    height: '100%',
  },
  inputInput: {
    padding: theme.spacing(1, 1, 1, 7),
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: 200,
    },
  },
  sectionDesktop: {
    display: 'none',
    [theme.breakpoints.up('md')]: {
      display: 'flex',
      alignItems: 'centrer',
    },
  },
  btDropDown: {
    display: 'none',
    minWidth: '32px',
    [theme.breakpoints.up('md')]: {
      display: 'flex',
      alignItems: 'centrer',
    },
  },
  avataDisplay: {
    margin: 10,
    width: 46,
    height: 46,
    [theme.breakpoints.up('md')]: {
      display: 'flex',
    },
  },
  menuIcon: {
    margin: theme.spacing(0, 1, 0, 0),
  },
  sectionMobile: {
    display: 'flex',
    [theme.breakpoints.up('md')]: {
      display: 'none',
    },
  },
  leftMenu: {
    display: 'none',
    '@media (max-width: 768px)': {
      display: 'block',
      cursor: 'pointer',
      margin: '0 25px 0 30px',
    },
  },
}));

const StyledMenu = withStyles({
  paper: {
    border: '1px solid #d3d4d5',
    borderRadius: 10,
  },
})(props => (
  <Menu
    elevation={0}
    getContentAnchorEl={null}
    anchorOrigin={{
      vertical: 'bottom',
      horizontal: 'center',
    }}
    transformOrigin={{
      vertical: 'top',
      horizontal: 'center',
    }}
    {...props}
  />
));

const StyledMenuItem = withStyles(theme => ({
  root: {
    borderRadius: 10,
    margin: theme.spacing(1),
    '&:focus': {
      backgroundColor: theme.palette.primary.main,
      '& .MuiListItemIcon-root, & .MuiListItemText-primary': {
        color: theme.palette.common.white,
      },
    },
  },
}))(MenuItem);

// const friReqList = [
//   {
//     id: 0,
//     avatar: 'https://i.pravatar.cc/300',
//     name: 'Huy Hoang',
//   },
//   {
//     id: 1,
//     avatar: 'https://i.pravatar.cc/300',
//     name: 'MyMy',
//   },
//   {
//     id: 2,
//     avatar: 'https://i.pravatar.cc/300',
//     name: 'Luong Hoa',
//   },
// ];

// const notifiList = [
//   {
//     id: 0,
//     avatar: 'https://i.pravatar.cc/300',
//     name: 'Huy Hoang',
//     promise: 'Its hard to find someone who will stay with you Its hard to find someone who will stay with you',
//     time: 'just now',
//   },
//   {
//     id: 1,
//     avatar: 'https://i.pravatar.cc/300',
//     name: 'MyMy',
//     promise: 'Its hard to find someone who will stay with you Its hard to find someone who will stay with you',
//     time: 'just now',
//   },
//   {
//     id: 2,
//     avatar: 'https://i.pravatar.cc/300',
//     name: 'Thi Truong',
//     promise: 'Its hard to find someone who will stay with you Its hard to find someone who will stay with you',
//     time: 'just now',
//   },
// ];

function Header(props) {
  const dispatch = useDispatch();
  const classes = useStyles();
  const needAuth = useSelector(state => state.account.needAuth);
  const isNewLock = useSelector(state => state.globalData.isNewLock);
  const mnemonic = useSelector(state => state.account.mnemonic);
  const privateKey = useSelector(state => state.account.privateKey);
  const mode = useSelector(state => state.account.mode);
  const address = useSelector(state => state.account.address);

  const [showPhrase, setShowPhrase] = useState(false);
  // const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = useState(null);
  // const [anchorElNoti, setAnchorElNoti] = useState(null);
  const [anchorElMenu, setAnchorElMenu] = useState(null);
  const [isLeftMenuOpened, setIsLeftMenuOpened] = useState(false);

  const isMenuOpen = Boolean(anchorElMenu);
  const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);

  const lockIndexText = props.match.params.index;
  const lockIndexInt = parseInt(lockIndexText, 10);
  const lockIndex =
    isNaN(lockIndexInt) || lockIndexInt < 0 || !Number.isInteger(lockIndexInt) ? undefined : lockIndexInt;

  function handeOpenMypage() {
    if (props.match.path === '/u/:address') {
      window.location.href = `/u/${address}`
    } else {
      props.history.push(`/u/${address}`);
    }
  }
  function handeExpandMore(event) {
    setAnchorElMenu(event.currentTarget);
  }
  function handleMobileMenuClose() {
    setMobileMoreAnchorEl(null);
  }

  function handleMenuClose() {
    setAnchorElMenu(null);
    handleMobileMenuClose();
  }

  function handleMobileMenuOpen(event) {
    setMobileMoreAnchorEl(event.currentTarget);
  }

  // function handleFriReqOpen(event) {
  //   setAnchorEl(event.currentTarget);
  // }

  // function handleFriReqClose() {
  //   setAnchorEl(null);
  // }

  // function handleNotiOpen(event) {
  //   setAnchorElNoti(event.currentTarget);
  // }

  // function handleNotiClose() {
  //   setAnchorElNoti(null);
  // }

  function handeExplore() {
    props.history.push('/explore');
  }
  function handeNewLock() {
    dispatch(actions.setNewLock(true));
  }
  function closePopup() {
    dispatch(actions.setNewLock(false));
  }
  function handleShowphrase() {
    dispatch(actions.setNeedAuth(true));
    setShowPhrase(true);
  }
  function closeShowMnemonic() {
    setShowPhrase(false);
  }

  const tokenAddress = useSelector(state => state.account.tokenAddress);
  // const privateKey = useSelector(state => state.account.privateKey);
  const displayName = useSelector(state => state.account.displayName);
  const avatarRedux = useSelector(state => state.account.avatar);

  useEffect(() => {
    async function fetchData() {
      try {
        if (address) {
          const [tags, isApproved] = await getAuthenAndTags(address, tokenAddress);
          dispatch(actions.setAccount({ displayName: tags['display-name'] || '', avatar: tags.avatar, isApproved }));
        }
      } catch (e) {
        console.error(e);
      }
    }
    fetchData();
  }, [address, tokenAddress, dispatch]);

  const renderMenu = (
    <StyledMenu
      className={classes.profileMenu}
      anchorEl={anchorElMenu}
      keepMounted
      open={isMenuOpen}
      onClose={handleMenuClose}
    >
      <StyledMenuItem
        onClick={() => {
          props.history.push('/profile');
          handleMenuClose();
        }}
      >
        <ListItemIcon>
          <PersonIcon />
        </ListItemIcon>
        <ListItemText primary="Update Profile" />
      </StyledMenuItem>
      <Divider />
      <StyledMenuItem
        onClick={() => {
          handleShowphrase();
          handleMenuClose();
        }}
      >
        <ListItemIcon>
          <VpnKeyIcon />
        </ListItemIcon>
        <ListItemText primary="View recovery phrase" />
      </StyledMenuItem>
      {/* <StyledMenuItem
        onClick={() => {
          props.history.push('/register');
          handleMenuClose();
        }}
      >
        <ListItemIcon>
          <AddIcon />
        </ListItemIcon>
        <ListItemText primary="Create New Account" />
      </StyledMenuItem> */}

      {/* <StyledMenuItem
        onClick={() => {
          props.history.push('/login');
          handleMenuClose();
        }}
      >
        <ListItemIcon>
          <ExitToAppIcon />
        </ListItemIcon>
        <ListItemText primary="Change Account" />
      </StyledMenuItem> */}
    </StyledMenu>
  );

  // const friReqMenu = (
  //   <StyledMenu id="friReq-menu" anchorEl={anchorEl} keepMounted open={Boolean(anchorEl)} onClose={handleFriReqClose}>
  //     <StyledMenuItem className={classes.friReqStyle}>
  //       <ListItemText primary="Friend Request" className={classes.friReqTitle} />
  //       <ListItemText align="right" primary="Setting" className={classes.friReqSetting} />
  //     </StyledMenuItem>
  //     {friReqList.map(({ id, avatar, name }) => (
  //       <StyledMenuItem className={classes.friReqStyle} key={id}>
  //         <ListItemAvatar>
  //           <AvatarPro alt="avatar" src={avatar} className={classes.jsxAvatar} />
  //         </ListItemAvatar>
  //         <ListItemText primary={name} className={classes.friReqName} />
  //         <ListItemText primary="CONFIRM" className={classes.friReqConfirm} />
  //         <ListItemText primary="DELETE" />
  //       </StyledMenuItem>
  //     ))}
  //     <StyledMenuItem className={classes.friReqStyle}>
  //       <ListItemText align="center" primary="See all" className={classes.friReqSetting} />
  //     </StyledMenuItem>
  //   </StyledMenu>
  // );

  // const notiList = (
  //   <StyledMenu
  //     id="notifi-menu"
  //     anchorEl={anchorElNoti}
  //     keepMounted
  //     open={Boolean(anchorElNoti)}
  //     onClose={handleNotiClose}
  //   >
  //     <StyledMenuItem className={classes.friReqStyle}>
  //       <ListItemText primary="Notification" className={classes.friReqTitle} />
  //       <ListItemText align="right" primary="Mark all read" className={classes.friReqConfirm} />
  //       <ListItemText align="center" primary="Setting" className={classes.friReqConfirm} />
  //     </StyledMenuItem>
  //     {notifiList.map(({ id, avatar, name, promise, time }) => (
  //       <List className={classes.listNoti} component="nav" key={id}>
  //         <ListItem alignItems="flex-start" button className={classes.listItemNotiStyle}>
  //           <ListItemAvatar>
  //             <AvatarPro alt="Remy Sharp" src={avatar} />
  //           </ListItemAvatar>
  //           <ListItemText
  //             primary={
  //               <>
  //                 <Typography component="span" variant="body2" color="textPrimary">
  //                   {name}
  //                 </Typography>
  //                 {' sent you a promise'}
  //               </>
  //             }
  //             secondary={
  //               <>
  //                 <Typography variant="caption" className={classes.notiPromise} color="textPrimary">
  //                   {promise}
  //                 </Typography>
  //                 <Typography component="span" variant="body2">
  //                   {time}
  //                 </Typography>
  //               </>
  //             }
  //           />
  //         </ListItem>
  //         <Divider variant="inset" />
  //       </List>
  //     ))}
  //     <StyledMenuItem className={classes.friReqStyle}>
  //       <ListItemText align="center" primary="See all" className={classes.friReqSetting} />
  //     </StyledMenuItem>
  //   </StyledMenu>
  // );

  const mobileMenuId = 'primary-search-account-menu-mobile';
  const renderMobileMenu = (
    <Menu
      anchorEl={mobileMoreAnchorEl}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      id={mobileMenuId}
      keepMounted
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      open={isMobileMenuOpen}
      onClose={handleMobileMenuClose}
    >
      {/* <MenuItem>
        <IconButton aria-label="show 4 new mails" color="inherit">
          <Badge badgeContent={4} color="primary">
            <GroupIcon />
          </Badge>
        </IconButton>
        <p>Messages</p>
      </MenuItem>
      <MenuItem>
        <IconButton aria-label="show 11 new notifications" color="inherit">
          <Badge badgeContent={11} color="primary">
            <NotificationsIcon />
          </Badge>
        </IconButton>
        <p>Notifications</p>
      </MenuItem> */}
      <MenuItem onClick={handeOpenMypage}>
        <IconButton
          aria-label="profile settings"
          aria-controls="primary-search-profile-menu"
          aria-haspopup="true"
          color="inherit"
        >
          <AccountCircle />
        </IconButton>
        <p>MyPage</p>
      </MenuItem>
      <MenuItem onClick={handeNewLock}>
        <IconButton
          aria-label="explore post of other users"
          aria-controls="primary-search-explore-menu"
          color="inherit"
        >
          <AddIcon />
        </IconButton>
        <p>Create</p>
      </MenuItem>
      <MenuItem onClick={handeExplore}>
        <IconButton
          aria-label="explore post of other users"
          aria-controls="primary-search-explore-menu"
          color="inherit"
        >
          <ExploreIcon />
        </IconButton>
        <p>Explore</p>
      </MenuItem>
      <MenuItem onClick={handeExpandMore}>
        <IconButton
          aria-label="profile settings"
          aria-controls="primary-search-profile-menu"
          aria-haspopup="true"
          color="inherit"
        >
          <ArrowDropDownIcon />
        </IconButton>
        <p>More</p>
      </MenuItem>
    </Menu>
  );

  return (
    <div>
      <div className={classes.grow}>
        <StyledAppBar position="static" color="inherit" className={`${classes.AppBar} main-appbar`}>
          <StyledToolbar>
            <MenuIcon
              fontSize="large"
              className={classes.leftMenu}
              onClick={() => setIsLeftMenuOpened(!isLeftMenuOpened)}
            />
            <Drawer open={isLeftMenuOpened} onClose={() => setIsLeftMenuOpened(false)}>
              <LeftContainer proIndex={lockIndex} closeMobileMenu={setIsLeftMenuOpened} />
            </Drawer>
            <StyledLogo to="/">
              <img src="/static/img/logo.svg" alt="itea-scan" />
              <span>LoveLock</span>
            </StyledLogo>
            {address && (
              <>
                {/* <div className={classes.search}>
                  <div className={classes.searchIcon}>
                    <SearchIcon />
                  </div>
                  <InputBase
                    placeholder="Search…"
                    classes={{
                      root: classes.inputRoot,
                      input: classes.inputInput,
                    }}
                    inputProps={{ 'aria-label': 'search' }}
                  />
                </div> */}
                <div className={classes.grow} />
                <Button className={classes.sectionDesktop} onClick={handeOpenMypage}>
                  <AvatarPro alt="avatar" hash={avatarRedux} className={classes.jsxAvatar} />
                  <Typography className={classes.title} noWrap>
                    {displayName}
                  </Typography>
                </Button>
                <Button className={classes.sectionDesktop} onClick={handeNewLock}>
                  <Typography className={classes.title} noWrap>
                    Create
                  </Typography>
                </Button>
                <Button className={classes.sectionDesktop} onClick={handeExplore}>
                  <Typography className={classes.title} noWrap>
                    Explore
                  </Typography>
                </Button>
                <Button className={classes.btDropDown} onClick={handeExpandMore}>
                  <ArrowDropDownIcon className={classes.expandMore} />
                </Button>

                {/* <div className={classes.sectionDesktop}>
                  <IconButton
                    color="inherit"
                    className={classes.menuIcon}
                    aria-controls="friReq-menu"
                    aria-haspopup="true"
                    variant="contained"
                    onClick={handleFriReqOpen}
                  >
                    <Badge badgeContent={0} color="primary">
                      <GroupIcon />
                    </Badge>
                  </IconButton>
                  <IconButton
                    color="inherit"
                    className={classes.menuIcon}
                    aria-controls="notifi-menu"
                    aria-haspopup="true"
                    variant="contained"
                    onClick={handleNotiOpen}
                  >
                    <Badge badgeContent={0} color="primary">
                      <NotificationsIcon />
                    </Badge>
                  </IconButton>
                </div> */}
                <div className={classes.sectionMobile}>
                  <IconButton
                    aria-label="show more"
                    aria-controls={mobileMenuId}
                    aria-haspopup="true"
                    onClick={handleMobileMenuOpen}
                    color="inherit"
                  >
                    <MoreIcon />
                  </IconButton>
                </div>
              </>
            )}
          </StyledToolbar>
        </StyledAppBar>
      </div>
      {renderMobileMenu}
      {renderMenu}
      {/* friReqMenu */}
      {/* notiList */}
      {needAuth && <PasswordPrompt />}
      {isNewLock && <PuNewLock history={props.history} close={closePopup} />}
      {!needAuth && showPhrase && (mode === 1 ? mnemonic : privateKey) && <ShowMnemonic close={closeShowMnemonic} />}
    </div>
  );
}

export default withRouter(Header);
