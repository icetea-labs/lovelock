import { actionTypes } from '../actions/create';

const initialState = {
  password: '',
  address: '',
  privateKey: '',
  keyStore: '',
  step: 'one',
  mnemonic: '',
  keyStoreText: '',
  showPrivateKey: false,
  confirmMnemonic: false,
  isRemember: window.localStorage.remember !== '0',
  pathName: '',
};

function create(state = initialState, action) {
  switch (action.type) {
    case actionTypes.SET_PASSWORD:
      return { ...state, password: action.password };
    case actionTypes.SET_STEP:
      return { ...state, step: action.step };
    case actionTypes.SET_ISREMEMBER: {
      const boolValue = !!action.data;
      window.localStorage.remember = boolValue ? '1' : '0';
      return { ...state, isRemember: boolValue };
    }
    case actionTypes.SET_PATH_NAME:
      return { ...state, pathName: action.data };
    // case actionTypes.SET_ACCOUNT:
    //   return Object.assign({}, state, action.data);
    case actionTypes.SET_SHOW_PRIVATEKEY:
      return { ...state, showPrivateKey: action.data };
    case actionTypes.SET_CONFIRM_MNEMONIC:
      return { ...state, confirmMnemonic: action.data };
    default:
      return state;
  }
}

export default create;
