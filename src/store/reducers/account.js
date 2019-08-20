import { actionTypes } from '../actions/account';

const initialState = Object.assign(
  {
    needAuth: false,
    address: '',
    cipher: '',
    privateKey: '',
    encryptedData: '',
  },
  (function getSessionStorage() {
    const resp = {};
    let user = localStorage.getItem('user') || sessionStorage.getItem('user');

    if (user && JSON.parse(user).address) {
      user = JSON.parse(user);
      resp.address = user.address;
      resp.privateKey = user.privateKey;
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
