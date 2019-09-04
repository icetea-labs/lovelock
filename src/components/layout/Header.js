import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { getTagsInfo } from '../../helper';
import { rem } from '../elements/StyledUtils';
import { fade, makeStyles, withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import InputBase from '@material-ui/core/InputBase';
import Badge from '@material-ui/core/Badge';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';
import Avatar from '@material-ui/core/Avatar';
import GetKeyToAuthen from './GetKeyToAuthen';
import Button from '@material-ui/core/Button';

import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';

import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import SearchIcon from '@material-ui/icons/Search';
import AccountCircle from '@material-ui/icons/AccountCircle';
import GroupIcon from '@material-ui/icons/Group';
import NotificationsIcon from '@material-ui/icons/Notifications';
import MoreIcon from '@material-ui/icons/MoreVert';

const StyledLogo = styled.a`
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

const StyledAppBar = withStyles(theme => ({
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
    width: 960,
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
  avatar: {
    margin: 10,
    width: 46,
    height: 46,
  },
  friReqTitle: {
    width: 111,
    height: 18,
    marginLeft: theme.spacing(2),
    color: '#373737',
  },
  // friReqStyle: {
  //   width: 393,
  //   height: 56,
  // },
  friReqSetting: {
    width: 46,
    height: 15,
    fontSize: 12,
    marginRight: theme.spacing(2),
    color: '#8250c8',
  },
  friReqConfirm: {
    color: '#8250c8',
  },
  friReqName: {
    width: 135,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    display: 'none',
    [theme.breakpoints.up('sm')]: {
      display: 'block',
      minWidth: 50,
      margin: theme.spacing(0, 3, 0, 0),
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
  avataDisplay: {
    display: 'none',
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
}));

const StyledMenu = withStyles({
  paper: {
    border: '1px solid #d3d4d5',
    width: 422,
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
    '&:focus': {
      backgroundColor: theme.palette.primary.main,
      '& .MuiListItemIcon-root, & .MuiListItemText-primary': {
        color: theme.palette.common.white,
      },
    },
  },
}))(MenuItem);

const friReqList = [
  {
    id: 0,
    avatar: '/static/img/user-men.jpg',
    name: 'HuyHQ',
  },
  {
    id: 1,
    avatar: '/static/img/user-women.jpg',
    name: 'MyNTT',
  },
  {
    id: 2,
    avatar: '/static/img/user-men.jpg',
    name: 'ChuChimNhoBoCaTheGioi',
  },
];

export default function Header() {
  const classes = useStyles();
  const needAuth = useSelector(state => state.account.needAuth);
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = useState(null);

  const isMenuOpen = Boolean(anchorEl);
  const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);

  function handleProfileMenuOpen(event) {
    setAnchorEl(event.currentTarget);
  }

  function handleMobileMenuClose() {
    setMobileMoreAnchorEl(null);
  }

  function handleMenuClose() {
    setAnchorEl(null);
    handleMobileMenuClose();
  }

  function handleMobileMenuOpen(event) {
    setMobileMoreAnchorEl(event.currentTarget);
  }

  function handleFriReqOpen(event) {
    setAnchorEl(event.currentTarget);
  }

  function handleFriReqClose() {
    setAnchorEl(null);
  }

  const address = useSelector(state => state.account.address);
  const [displayName, setDisplayName] = useState(null);
  useEffect(() => {
    async function fetchData() {
      if (address) {
        // console.log('address', address);
        const reps = await getTagsInfo(address);
        setDisplayName(reps['display-name']);
      } else {
        setDisplayName('no name');
      }
    }
    fetchData();
  });
  const menuId = 'primary-search-account-menu';
  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      id={menuId}
      keepMounted
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      open={isMenuOpen}
      onClose={handleMenuClose}
    >
      <MenuItem onClick={handleMenuClose}>Profile</MenuItem>
      <MenuItem onClick={handleMenuClose}>My account</MenuItem>
    </Menu>
  );

  const friReqMenu = (
    <StyledMenu
      id="customized-menu"
      anchorEl={anchorEl}
      keepMounted
      open={Boolean(anchorEl)}
      onClose={handleFriReqClose}
    >
      <StyledMenuItem className={classes.friReqStyle}>
        <ListItemText primary="Friend Request" className={classes.friReqTitle} />
        <ListItemText align="right" primary="Setting" className={classes.friReqSetting} />
      </StyledMenuItem>
      {friReqList.map(({ id, avatar, name }) => (
        <StyledMenuItem className={classes.friReqStyle} key={id}>
          <ListItemAvatar>
            <Avatar alt="avatar" src={avatar} className={classes.avatar} />
          </ListItemAvatar>
          <ListItemText primary={name} className={classes.friReqName} />
          <ListItemText primary="CONFIRM" className={classes.friReqConfirm} />
          <ListItemText primary="DELETE" />
        </StyledMenuItem>
      ))}
    </StyledMenu>
  );

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
      <MenuItem>
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
      </MenuItem>
      <MenuItem onClick={handleProfileMenuOpen}>
        <IconButton
          aria-label="account of current user"
          aria-controls="primary-search-account-menu"
          aria-haspopup="true"
          color="inherit"
        >
          <AccountCircle />
        </IconButton>
        <p>Profile</p>
      </MenuItem>
    </Menu>
  );

  return (
    <div className={classes.grow}>
      <StyledAppBar position="static" color="inherit" className={classes.AppBar}>
        <StyledToolbar>
          <StyledLogo href="/">
            <img src="/static/img/logo.svg" alt="itea-scan" />
            <span>LoveLock</span>
          </StyledLogo>
          {address ? (
            <React.Fragment>
              <div className={classes.search}>
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
              </div>
              <div className={classes.grow} />
              <Avatar alt="avatar" src="/static/img/user-men.jpg" className={classes.avatar} />
              <Typography className={classes.title} noWrap>
                {displayName}
              </Typography>
              <Typography noWrap>Explore</Typography>
              <KeyboardArrowDownIcon className={classes.menuIcon} />
              <div className={classes.sectionDesktop}>
                <IconButton
                  aria-label="show 4 new mails"
                  color="inherit"
                  className={classes.menuIcon}
                  aria-controls="customized-menu"
                  // aria-haspopup="true"
                  variant="contained"
                  onClick={handleFriReqOpen}
                >
                  <Badge badgeContent={4} color="primary">
                    <GroupIcon />
                  </Badge>
                </IconButton>
                <IconButton aria-label="show 17 new notifications" color="inherit" className={classes.menuIcon}>
                  <Badge badgeContent={12} color="primary">
                    <NotificationsIcon />
                  </Badge>
                </IconButton>
                {/* <IconButton
              edge="end"
              aria-label="account of current user"
              aria-controls={menuId}
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              color="inherit"
            >
              <AccountCircle />
            </IconButton> */}
              </div>
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
            </React.Fragment>
          ) : (
            <React.Fragment>
              <Button href="/login" className={classes.menuButton} variant="contained" color="primary">
                Login
              </Button>
              <Button href="/register" className={classes.menuButton} variant="contained" color="primary">
                Register
              </Button>
            </React.Fragment>
          )}
        </StyledToolbar>
      </StyledAppBar>
      {renderMobileMenu}
      {/* {renderMenu} */}
      {friReqMenu}
      {needAuth && <GetKeyToAuthen />}
    </div>
  );
}
