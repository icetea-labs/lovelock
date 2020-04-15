import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useSelector, useDispatch } from 'react-redux';
import { fade, makeStyles, withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import InputBase from '@material-ui/core/InputBase';
import Badge from '@material-ui/core/Badge';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';
import Button from '@material-ui/core/Button';
import ListItemText from '@material-ui/core/ListItemText';
import List from '@material-ui/core/List';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Divider from '@material-ui/core/Divider';
import Drawer from '@material-ui/core/Drawer';

import SearchIcon from '@material-ui/icons/Search';
import MenuIcon from '@material-ui/icons/Menu';
import AccountCircle from '@material-ui/icons/AccountCircle';
import GroupIcon from '@material-ui/icons/Group';
import NotificationsIcon from '@material-ui/icons/Notifications';
import ExploreIcon from '@material-ui/icons/Explore';
import MoreIcon from '@material-ui/icons/MoreVert';
import PersonIcon from '@material-ui/icons/Person';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import AddIcon from '@material-ui/icons/Add';
import VpnKeyIcon from '@material-ui/icons/VpnKey';
//import LoyaltyIcon from '@material-ui/icons/Loyalty';
import { FormattedMessage } from 'react-intl';

import { Link, withRouter } from 'react-router-dom';
import Autosuggest from 'react-autosuggest';
import AutosuggestHighlightMatch from 'autosuggest-highlight/match';
import AutosuggestHighlightParse from 'autosuggest-highlight/parse';
import { rem } from '../elements/StyledUtils';
import { AvatarPro } from '../elements';
import PuNewLock from '../elements/PuNewLock';
import PuNotifyLock from '../elements/PuNotifyLock';
import PuConfirmLock from '../elements/PuConfirmLock';
import PasswordPrompt from './PasswordPrompt';
import ShowMnemonic from './ShowMnemonic';
import * as actions from '../../store/actions';
import { getAuthenAndTags, getUserSuggestions, diffTime } from '../../helper';
import LeftContainer from '../pages/Lock/LeftContainer';
import APIService from '../../service/apiService';
// import LandingPage from './LandingPage';

import Carousel, { Modal, ModalGateway } from 'react-images';

const StyledLogo = styled(Link)`
  display: none;
  @media (min-width: 600px) {
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
  }
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
    zIndex: 'auto',
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
  lockReqTitle: {
    color: '#fff',
  },
  lockReqTitleBg: {
    backgroundColor: '#8250c8',
    borderRadius: 10,
    margin: theme.spacing(1),
    height: 'fit-content',
  },
  lockReqSetting: {
    color: '#8250c8',
  },
  lockReqSettingBg: {
    margin: theme.spacing(2),
  },
  lockReqConfirm: {
    color: '#8250c8',
    marginRight: theme.spacing(2),
  },
  lockReqName: {
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
    // margin: theme.spacing(1),
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
      // minWidth: 50,
      // margin: theme.spacing(0, 3, 0, 0),
      textTransform: 'capitalize',
    },
  },
  titlePoint: {
    color: theme.palette.background.paper,
    fontSize: 13,
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
      '&:focus': {
        width: 240,
      },
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

function Header(props) {
  const dispatch = useDispatch();
  const classes = useStyles();
  const needAuth = useSelector(state => state.account.needAuth);
  const newLockDialog = useSelector(state => state.globalData.newLockDialog);
  const photoViewer = useSelector(state => state.globalData.photoViewer);
  const mnemonic = useSelector(state => state.account.mnemonic);
  const privateKey = useSelector(state => state.account.privateKey);
  const mode = useSelector(state => state.account.mode);
  const address = useSelector(state => state.account.address);
  const language = useSelector(state => state.globalData.language);
  const isApproved = useSelector(state => state.account.isApproved);
  const sideBarLocks = useSelector(state => state.loveinfo.locks);

  const [showPhrase, setShowPhrase] = useState(false);
  const [anchorElLockReq, setAnchorElLockReq] = useState(null);
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = useState(null);
  const [anchorElNoti, setAnchorElNoti] = useState(null);
  const [anchorElMenu, setAnchorElMenu] = useState(null);
  const [isLeftMenuOpened, setIsLeftMenuOpened] = useState(false);

  const [lockReqList, setLockReqList] = useState([]);
  const [notiList, setNotiList] = useState([]);

  const [searchValue, setSearchValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  const isMenuOpen = Boolean(anchorElMenu);
  const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);

  const lockIndexText = props.match.params.index;
  const lockIndexInt = parseInt(lockIndexText, 10);
  const lockIndex =
    isNaN(lockIndexInt) || lockIndexInt < 0 || !Number.isInteger(lockIndexInt) ? undefined : lockIndexInt;

  const tokenAddress = useSelector(state => state.account.tokenAddress);
  // const privateKey = useSelector(state => state.account.privateKey);
  const displayName = useSelector(state => state.account.displayName);
  // const point = useSelector(state => state.account.point);
  const avatarRedux = useSelector(state => state.account.avatar);

  const notifyLockData = useSelector(state => state.globalData.notifyLockData) || {};

  const ja = 'ja';
  const [apiLocks, setApiLocks] = useState([]);
  const [step, setStep] = useState('');

  function handeOpenMypage(addr) {
    addr = typeof addr === 'string' ? addr : address;
    if (props.match.path === '/u/:address') {
      window.location.href = `/u/${addr}`;
    } else {
      props.history.push(`/u/${addr}`);
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

  function handleLockReqOpen(event) {
    setAnchorElLockReq(event.currentTarget);
  }

  function handleLockReqClose() {
    setAnchorElLockReq(null);
  }

  function handleNotiOpen(event) {
    setAnchorElNoti(event.currentTarget);
  }

  function handleNotiClose() {
    setAnchorElNoti(null);
  }

  function handeExplore() {
    props.history.push('/explore');
  }
  function handeNewLock() {
    dispatch(actions.setShowNewLockDialog(true));
  }
  function closeNewLockDialog() {
    dispatch(actions.setShowNewLockDialog(false));
  }
  function closePhotoViewer() {
    dispatch(actions.setShowPhotoViewer(false));
  }
  function handleShowphrase() {
    dispatch(actions.setNeedAuth(true));
    setShowPhrase(true);
  }
  function closeShowMnemonic() {
    setShowPhrase(false);
  }

  function handleSelLock(lockId) {
    dispatch(
      actions.setNotifyLock({
        index: +lockId,
        show: true,
      })
    );
  }

  function closeNotiLock() {
    dispatch(
      actions.setNotifyLock({
        show: false,
      })
    );
  }

  function closeConfirmLock() {
    setStep('');
  }

  function nextToAccept() {
    setStep('accept');
    closeNotiLock();
  }

  function nextToDeny() {
    setStep('deny');
    closeNotiLock();
  }

  const getSuggestions = async value => {
    const users = await getUserSuggestions(value);
    setSuggestions(users);
  };

  const getSuggestionValue = suggestion => {
    return `@${suggestion.nick}`;
  };

  const renderSearchMatch = (parts, isNick) => {
    return (
      <>
        {parts.map((part, index) => {
          const className = part.highlight ? 'highlight' : null;
          return (
            <span className={className} key={index}>
              {(isNick && part.highlight ? '@' : '') + part.text}
            </span>
          );
        })}
      </>
    );
  };

  const renderSuggestion = (suggestion, { query }) => {
    const isNick = query.startsWith('@');
    const searchFor = isNick ? query.slice(1) : query;
    const suggestionText = isNick ? suggestion.nick : suggestion.display;
    const suggestionAva = suggestion.avatar;
    const matches = AutosuggestHighlightMatch(suggestionText, searchFor);
    const parts = AutosuggestHighlightParse(suggestionText, matches);
    return (
      <span className="suggestion-content">
        <AvatarPro hash={suggestionAva} />
        <div className="text">
          <span className="name">{isNick ? suggestion.display : renderSearchMatch(parts, false)}</span>
          <span className="nick">{isNick ? renderSearchMatch(parts, true) : `@${suggestion.nick}`}</span>
        </div>
      </span>
    );
  };

  const onSearchChanged = (event, { newValue, method }) => {
    setSearchValue(newValue);
    if (method !== 'enter' && method !== 'click') return;

    // get the item
    const name = newValue.substring(1);
    if (suggestions) {
      const seletedItem = suggestions.find(item => item.nick === name);
      if (seletedItem) {
        handeOpenMypage(seletedItem.nick || seletedItem.address);
      }
    }
  };

  const onSuggestionsFetchRequested = ({ value }) => {
    getSuggestions(value);
  };

  const onSuggestionsClearRequested = () => {
    setSuggestions([]);
  };

  function IsJsonString(str) {
    try {
      JSON.parse(str);
    } catch (e) {
      return false;
    }
    return true;
  }

  useEffect(() => {
    async function fetchData() {
      try {
        if (address) {
          const [tags, isApproved] = await getAuthenAndTags(address, tokenAddress);
          const userPoint = await APIService.getUserByAddress(address);
          dispatch(
            actions.setAccount({
              displayName: tags['display-name'] || '',
              avatar: tags.avatar,
              isApproved,
              point: userPoint.token,
            })
          );
        }
      } catch (e) {
        console.error(e);
      }
    }
    fetchData();
  }, [address, tokenAddress, dispatch]);

  useEffect(() => {
    const abort = new AbortController();
    fetch(`${process.env.REACT_APP_API}/noti/list?address=${address}`, { signal: abort.signal })
      .then(r => r.json())
      .then(data => {
        const lockRequests = [];
        const allLocksList = [];
        if (data.result && data.result.length > 0) {
          for (let i = 0; i < data.result.length; i++) {
            if (data.result[i].event_name === 'createLock') {
              const lockReq = {
                id: data.result[i].id,
                avatar: data.result[i].avatar,
                name: data.result[i].display_name,
                lockId: data.result[i].lockIndex,
              };
              const allLocks = {
                id: data.result[i].lockIndex,
                sender: data.result[i].sender,
                receiver: data.result[i].receiver,
                s_content: data.result[i].content,
                coverImg: data.result[i].coverImg,
                status: data.result[i].status,
                displayName: data.result[i].display_name,
              };
              lockRequests.push(lockReq);
              allLocksList.push(allLocks);
            }
            setApiLocks(allLocksList);
          }
        }
        setLockReqList(lockRequests);
      })
      .catch(err => {
        if (err.name === 'AbortError') return;
        throw err;
      });

    return () => {
      abort.abort();
    };
  }, []);

  useEffect(() => {
    const abort = new AbortController();
    const memoryList = [];
    fetch(`${process.env.REACT_APP_API}/noti/list?address=${address}`, { signal: abort.signal })
      .then(r => r.json())
      .then(data => {
        // console.log('addMemory', data);
        if (data.result && data.result.length > 0) {
          for (let i = 0; i < data.result.length; i++) {
            if (data.result[i].event_name === 'addMemory') {
              const contentFrApi = data.result[i].content;
              let contentNoti;
              if (IsJsonString(contentFrApi)) {
                const obj = JSON.parse(contentFrApi);
                contentNoti = obj.meta.title;
              } else {
                contentNoti = contentFrApi;
              }
              const memoryReq = {
                id: data.result[i].id,
                eventName: data.result[i].event_name,
                avatar: data.result[i].avatar,
                name: data.result[i].display_name,
                content: contentNoti,
                lockId: data.result[i].lockIndex,
                time: data.result[i].created_at,
              };
              memoryList.push(memoryReq);
            }
          }
        }
      })
      .catch(err => {
        if (err.name === 'AbortError') return;
        throw err;
      });

    fetch(`${process.env.REACT_APP_API}/noti/list/lc?address=${address}`, { signal: abort.signal })
      .then(r => r.json())
      .then(data => {
        // console.log('addLikeCmt', data);
        if (data.result && data.result.length > 0) {
          for (let i = 0; i < data.result.length; i++) {
            const senderNoti = data.result[i].sender;
            if (address !== senderNoti) {
              const likeCmt = {
                id: data.result[i].id,
                eventName: data.result[i].event_name,
                avatar: data.result[i].avatar,
                name: data.result[i].display_name,
                content: data.result[i].content,
                lockId: data.result[i].lockIndex,
                time: data.result[i].created_at,
              };
              memoryList.push(likeCmt);
            }
          }
        }
      })
      .catch(err => {
        if (err.name === 'AbortError') return;
        throw err;
      });

    console.log('memoryList', memoryList);

    // setState
    setNotiList(memoryList);

    return () => {
      abort.abort();
    };
  }, []);

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
        <ListItemText primary={<FormattedMessage id="header.updateProfile" />} />
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
        <ListItemText primary={<FormattedMessage id="header.viewRecovery" />} />
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

  const renderLockRequests = () => (
    <StyledMenu
      id="lockReq-menu"
      anchorEl={anchorElLockReq}
      keepMounted
      open={Boolean(anchorElLockReq)}
      onClose={handleLockReqClose}
    >
      <div className={classes.lockReqTitleBg}>
        <ListItemText align="center" primary="Lock Request" className={classes.lockReqTitle} />
      </div>
      {lockReqList.slice(0, 5).map(({ id, avatar, name, lockId }) => (
        <StyledMenuItem
          className={classes.lockReqStyle}
          key={id}
          onClick={() => {
            lockReqList.length -= 1;
            handleSelLock(lockId);
            handleLockReqClose();
            fetch(`${process.env.REACT_APP_API}/noti/mark?id=${id}`);
          }}
        >
          <ListItemAvatar>
            <AvatarPro alt="avatar" src={avatar} className={classes.jsxAvatar} />
          </ListItemAvatar>
          <ListItemText primary={name} className={classes.lockReqName} />
          {/* <ListItemText primary="CONFIRM" className={classes.lockReqConfirm} /> */}
          {/* <ListItemText primary="DELETE" /> */}
        </StyledMenuItem>
      ))}
      <div className={classes.lockReqSettingBg}>
        {/* <ListItemText align="center" primary="See all" className={classes.lockReqSetting} /> */}
        {lockReqList.length === 0 && (
          <ListItemText align="center" primary="No request to you." className={classes.lockReqSetting} />
        )}
        {lockReqList.length > 5 && (
          <ListItemText
            align="center"
            primary={`and ${lockReqList.length - 5} more...`}
            className={classes.lockReqSetting}
          />
        )}
      </div>
    </StyledMenu>
  );

  const renderNotifications = () => (
    <StyledMenu
      id="notifi-menu"
      anchorEl={anchorElNoti}
      keepMounted
      open={Boolean(anchorElNoti)}
      onClose={handleNotiClose}
    >
      <div className={classes.lockReqTitleBg}>
        <ListItemText align="center" primary="Notification" className={classes.lockReqTitle} />
        {/* <ListItemText align="right" primary="Mark all read" className={classes.lockReqConfirm} />
        <ListItemText align="center" primary="Setting" className={classes.lockReqConfirm} /> */}
      </div>

      {notiList.slice(0, 5).map(({ id, avatar, name, content, time, eventName, lockId }) => (
        <List
          className={classes.listNoti}
          component="nav"
          key={id}
          onClick={() => {
            notiList.length -= 1;
            if (eventName === 'addMemory') {
              props.history.push(`/lock/${lockId}`);
            } else props.history.push(`/memory/${lockId}`);

            handleNotiClose();
            fetch(`${process.env.REACT_APP_API}/noti/mark?id=${id}`);
          }}
        >
          <ListItem alignItems="flex-start" button className={classes.listItemNotiStyle}>
            <ListItemAvatar>
              <AvatarPro alt="Remy Sharp" src={avatar} />
            </ListItemAvatar>
            <ListItemText
              primary={
                <>
                  {eventName === 'addMemory' && (
                    <Typography component="span" variant="body2" color="textPrimary">
                      {name} shared a new memory with you.
                    </Typography>
                  )}
                  {eventName === 'addLike' && (
                    <Typography component="span" variant="body2" color="textPrimary">
                      {name} liked your memory.
                    </Typography>
                  )}
                  {eventName === 'addComment' && (
                    <Typography component="span" variant="body2" color="textPrimary">
                      {name} wrote a comment in your memory.
                    </Typography>
                  )}
                </>
              }
              secondary={
                <>
                  <Typography variant="caption" className={classes.notiPromise} color="textPrimary">
                    {content}
                  </Typography>
                  <Typography component="span" variant="body2">
                    {diffTime(time)}
                  </Typography>
                </>
              }
            />
          </ListItem>
          <Divider variant="inset" />
        </List>
      ))}
      <div className={classes.lockReqSettingBg}>
        {/* <ListItemText align="center" primary="See all" className={classes.lockReqSetting} /> */}
        {notiList.length === 0 && (
          <ListItemText align="center" primary="No message to you." className={classes.lockReqSetting} />
        )}
        {notiList.length > 5 && (
          <ListItemText
            align="center"
            primary={`and ${notiList.length - 5} more...`}
            className={classes.lockReqSetting}
          />
        )}
      </div>
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
        <IconButton aria-label={`show ${lockReqList.length} new requests`} color="inherit">
          <Badge badgeContent={lockReqList.length} color="primary">
            <GroupIcon />
          </Badge>
        </IconButton>
        <p>Messages</p>
      </MenuItem>
      <MenuItem>
        <IconButton aria-label={`show ${notiList.length} new notifications`} color="inherit">
          <Badge badgeContent={notiList.length} color="primary">
            <NotificationsIcon />
          </Badge>
        </IconButton>
        <p>Notifications</p>
      </MenuItem>
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
      {isApproved && (
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
      )}
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
        <StyledAppBar position="relative" color="inherit" className={`${classes.AppBar} main-appbar`}>
          <StyledToolbar>
            <MenuIcon
              fontSize="large"
              className={classes.leftMenu}
              onClick={() => setIsLeftMenuOpened(!isLeftMenuOpened)}
            />
            <Drawer open={isLeftMenuOpened} onClose={() => setIsLeftMenuOpened(false)}>
              <LeftContainer proIndex={lockIndex} closeMobileMenu={setIsLeftMenuOpened} showNewLock context="header" />
            </Drawer>
            <StyledLogo to="/">
              <img src="/static/img/logo.svg" alt="itea-scan" />
              <span>LoveLock</span>
            </StyledLogo>
            {address && (
              <>
                <div className={classes.search}>
                  <div className={classes.searchIcon}>
                    <SearchIcon />
                  </div>
                  <Autosuggest
                    id="suggestSearch"
                    suggestions={suggestions}
                    onSuggestionsFetchRequested={onSuggestionsFetchRequested}
                    onSuggestionsClearRequested={onSuggestionsClearRequested}
                    getSuggestionValue={getSuggestionValue}
                    renderSuggestion={renderSuggestion}
                    inputProps={{
                      value: searchValue,
                      onChange: onSearchChanged,
                    }}
                    theme={{
                      container: 'react-autosuggest__container',
                      containerOpen: 'react-autosuggest-search__container--open',
                      inputOpen: 'react-autosuggest__input--open',
                      inputFocused: 'react-autosuggest__input--focused',
                      suggestionsContainer: 'react-autosuggest-search__suggestions-container',
                      suggestionsContainerOpen: 'react-autosuggest__suggestions-container--open',
                      suggestionsList: 'react-autosuggest__suggestions-list',
                      suggestion: 'react-autosuggest__suggestion',
                      suggestionFirst: 'react-autosuggest__suggestion--first',
                      suggestionHighlighted: 'react-autosuggest__suggestion--highlighted',
                      sectionContainer: 'react-autosuggest__section-container',
                      sectionContainerFirst: 'react-autosuggest__section-container--first',
                      sectionTitle: 'react-autosuggest__section-title',
                    }}
                    renderInputComponent={inputProps => (
                      <InputBase
                        placeholder={language === ja ? '検索…' : 'Search…'}
                        classes={{
                          root: classes.inputRoot,
                          input: classes.inputInput,
                        }}
                        inputProps={{ 'aria-label': 'search', type: 'search', ...inputProps }}
                      />
                    )}
                  />
                  {/* <InputBase
                    placeholder="Search…"
                    classes={{
                      root: classes.inputRoot,
                      input: classes.inputInput,
                    }}
                    inputProps={{ 'aria-label': 'search' }}
                  /> */}
                </div>
                <div className={classes.grow} />
                <Button onClick={handeOpenMypage}>
                  <AvatarPro alt="avatar" hash={avatarRedux} className={classes.jsxAvatar} />
                  <Typography className={classes.title} noWrap>
                    {displayName ? displayName.split(' ', 2)[0] : '(Unnamed)'}
                  </Typography>
                  {/* <ListItemText
                    className={classes.titlePoint}
                    primary={displayName ? displayName.split(' ', 2)[0] : '(Unnamed)'}
                    secondary={
                      <span className={classes.titlePoint}>
                        {point} <LoyaltyIcon />
                      </span>
                    }
                  /> */}
                </Button>
                {isApproved && (
                  <Button className={classes.sectionDesktop} onClick={handeNewLock}>
                    <Typography className={classes.title} noWrap>
                      <FormattedMessage id="header.btnCreate" />
                    </Typography>
                  </Button>
                )}

                <div className={classes.sectionDesktop}>
                  <IconButton
                    color="inherit"
                    className={classes.menuIcon}
                    aria-controls="lockReq-menu"
                    aria-haspopup="true"
                    variant="contained"
                    onClick={handleLockReqOpen}
                  >
                    <Badge badgeContent={lockReqList.length} color="secondary">
                      <GroupIcon />
                    </Badge>
                  </IconButton>
                  <IconButton
                    color="inherit"
                    className={classes.menuIcon}
                    aria-controls="noti-menu"
                    aria-haspopup="true"
                    variant="contained"
                    onClick={handleNotiOpen}
                  >
                    <Badge badgeContent={notiList.length} color="secondary">
                      <NotificationsIcon />
                    </Badge>
                  </IconButton>
                </div>

                <Button className={classes.sectionDesktop} onClick={handeExplore}>
                  <Typography className={classes.title} noWrap>
                    <FormattedMessage id="header.btnExplore" />
                  </Typography>
                </Button>
                <Button className={classes.btDropDown} onClick={handeExpandMore}>
                  <ArrowDropDownIcon className={classes.expandMore} />
                </Button>

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
      {renderLockRequests()}
      {renderNotifications()}
      {needAuth && <PasswordPrompt />}
      {newLockDialog && <PuNewLock history={props.history} close={closeNewLockDialog} />}
      {!needAuth && showPhrase && (mode === 1 ? mnemonic : privateKey) && <ShowMnemonic close={closeShowMnemonic} />}
      {notifyLockData.show && (
        <PuNotifyLock
          index={notifyLockData.index}
          locks={(sideBarLocks || []).concat(apiLocks)}
          address={address}
          close={closeNotiLock}
          accept={nextToAccept}
          deny={nextToDeny}
        />
      )}
      {step === 'accept' && <PuConfirmLock close={closeConfirmLock} index={notifyLockData.index} />}
      {step === 'deny' && <PuConfirmLock isDeny close={closeConfirmLock} index={notifyLockData.index} />}
      <ModalGateway>
        {photoViewer ? (
          <Modal onClose={closePhotoViewer}>
            <Carousel currentIndex={photoViewer.currentIndex} views={photoViewer.views} />
          </Modal>
        ) : null}
      </ModalGateway>
    </div>
  );
}

export default withRouter(Header);
