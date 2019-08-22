import { AccountType } from '@iceteachain/common';
import { actionTypes } from '../actions/account';

const initialState = Object.assign(
  {
    needAuth: false,
    address: '',
    cipher: '',
    privateKey: '',
    balance: '',
    keyStore: '',
    mnemonic: '',
    encryptedData: '',
    indexBankKey: 0,
    indexRegularKey: 0,
    childKey: [],
    flags: {
      isHardware: false,
      isLedger: false,
      isCoinomi: false,
      isCoinomiEmulate: false,
      isInfinito: false,
      isInfinitoEmulate: false,
      isWalletConnect: false,
    },
    wcUri: '',
    userInfo: {},
  },
  (function getSessionStorage() {
    const resp = {};
    let user = localStorage.getItem('user') || sessionStorage.getItem('user');

    if (user && JSON.parse(user).address) {
      user = JSON.parse(user);
      resp.address = user.address;
      resp.flags = user.flags || {};
      resp.encryptedData = user.mnemonic;
      // resp.mnemonic = user.mnemonic;
      resp.indexBankKey = user.indexBankKey;
      resp.indexRegularKey = user.indexRegularKey;
      resp.childKey = user.childKey;
    }
    return resp;
  })()
);

const addChildKey = (state, action, type) => {
  const childKey = {
    index: action.data.indexKey,
    address: action.data.address,
    selected: action.data.selected || false,
    balance: action.data.balance || 0,
    privateKey: action.data.privateKey || '',
  };
  let isNewAddress = true;
  let isLocal = true;
  let userInfo = {};
  const userInfoFromLocal = localStorage.getItem('user');
  const userInfoFromSession = sessionStorage.getItem('user');

  if (userInfoFromLocal) {
    userInfo = JSON.parse(userInfoFromLocal);
    isLocal = true;
  } else {
    userInfo = (userInfoFromSession && JSON.parse(userInfoFromSession)) || {};
    isLocal = false;
  }
  // userInfo = (userInfo && JSON.parse(userInfo)) || {};

  for (let i = 0; i < userInfo.childKey.length; i += 1) {
    const account = userInfo.childKey[i];
    // console.log('account', account);
    if (account.address === childKey.address) {
      isNewAddress = false;
      break;
    }
  }

  if (isNewAddress) {
    // add to storage
    userInfo.childKey.push({ index: childKey.index, address: childKey.address, selected: false });
    type === AccountType.BANK_ACCOUNT
      ? (userInfo.indexBankKey = action.data.indexKey)
      : (userInfo.indexRegularKey = action.data.indexKey);

    if (isLocal) {
      localStorage.setItem('user', JSON.stringify(userInfo));
    } else {
      sessionStorage.setItem('user', JSON.stringify(userInfo));
    }

    const newChildKey = state.childKey.slice(0);
    newChildKey.push(childKey);

    return newChildKey;
  }

  return state.childKey;
};

const account = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.SET_ACCOUNT:
      // addChildKey(state, action);
      return Object.assign({}, state, action.data);

    case actionTypes.ADD_NEW_BANK_ACCOUNT:
      return Object.assign(
        {},
        state,
        { indexBankKey: action.data.indexKey },
        { childKey: addChildKey(state, action, AccountType.BANK_ACCOUNT) }
      );

    case actionTypes.ADD_NEW_REGULAR_ACCOUNT:
      return Object.assign(
        {},
        state,
        { indexRegularKey: action.data.indexKey },
        { childKey: addChildKey(state, action, AccountType.REGULAR_ACCOUNT) }
      );

    case actionTypes.IMPORT_NEW_ACCOUNT:
      return addChildKey(state, action);

    case actionTypes.SET_BALANCE_CHILDKEY:
      return Object.assign({}, state, {
        childKey: action.data,
      });

    case actionTypes.SET_USER_INFO:
      return Object.assign({}, state, {
        userInfo: action.data,
      });

    case actionTypes.SET_WALLETCONNECT_URI:
      return Object.assign({}, state, {
        wcUri: action.data,
      });
    case actionTypes.SET_NEEDAUTH:
      if (state.flags.isHardware) action.data = false;
      return Object.assign({}, state, {
        needAuth: action.data,
      });
    default:
      return state;
  }
};

export default account;
