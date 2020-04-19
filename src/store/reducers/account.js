import { decode as codecDecode, toString as codecToString } from '@iceteachain/common/src/codec';
import { actionTypes } from '../actions/account';

const initialState = {
  needAuth: false,
  isApproved: true,
  publicKey: '',
  cipher: '',
  address: '',
  privateKey: '',
  tokenAddress: '',
  tokenKey: '',
  expireAfter: '',
  mnemonic: '',
  encryptedData: '',
  displayName: '',
  mode: '',
  point: '',
  ...(function getSessionStorage() {
    const resp = {};
    const sessionData = sessionStorage.getItem('sessionData') || localStorage.getItem('sessionData');

    if (sessionData) {
      const token = codecDecode(Buffer.from(sessionData, 'base64'));
      const expiredSoon = process.env.REACT_APP_CONTRACT !== token.contract || token.expireAfter - Date.now() < 60 * 1000;
      if (!expiredSoon) {
        resp.tokenKey = codecToString(token.tokenKey);
        import(
          /* webpackChunkName: "tweb3" */
          '../../service/tweb3'
        ).then(({ getWeb3 }) => {
          getWeb3().wallet.importAccount(token.tokenKey);
        })

        resp.tokenAddress = token.tokenAddress;
      }
      resp.expireAfter = token.expireAfter;
    }

    let user = localStorage.getItem('user') || sessionStorage.getItem('user');
    // eslint-disable-next-line no-cond-assign
    if ((user = (user && JSON.parse(user)) || {}).address) {
      resp.address = user.address;
      resp.mode = user.mode; //  0: privatekey - 1: mnemonic
      resp.encryptedData = user.keyObject;
    }

    return resp;
  })(),
};

const account = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.SET_ACCOUNT:
      return { ...state, ...action.data };

    case actionTypes.SET_NEEDAUTH:
      return { ...state, needAuth: action.data };
      
    default:
      return state;
  }
};

export default account;
