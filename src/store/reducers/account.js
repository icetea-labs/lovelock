import { AccountType } from '@iceteachain/common';
import { actionTypes } from '../actions/account';
import tweb3 from '../../service/tweb3';
const initialState = Object.assign(
  {
    needAuth: false,
    address: '',
    cipher: '',
    privateKey: '',
    mnemonic: '',
    encryptedData: '',
  },
  (function getSessionStorage() {
    const resp = {};
    let user = localStorage.getItem('user') || sessionStorage.getItem('user');

    if (user && JSON.parse(user).address) {
      user = JSON.parse(user);
      console.log('user', user);
      resp.address = user.address;
      // resp.privateKey = user.privateKey;
      resp.encryptedData = user.keyObject;
      // tweb3.wallet.importAccount(user.privateKey);
      // tweb3.wallet.defaultAccount = user.address;
    }
    return resp;
  })()
);

const account = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.SET_ACCOUNT:
      return Object.assign({}, state, action.data);

    case actionTypes.IMPORT_NEW_ACCOUNT:
      return Object.assign({}, state, action.data);

    case actionTypes.SET_USER_INFO:
      return Object.assign({}, state, {
        userInfo: action.data,
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
