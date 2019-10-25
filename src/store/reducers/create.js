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
  isRemember: true,
  pathName: '',
};

function create(state = initialState, action) {
  switch (action.type) {
    case actionTypes.SET_PASSWORD:
      return Object.assign({}, state, {
        password: action.password,
      });
    case actionTypes.SET_STEP:
      return Object.assign({}, state, {
        step: action.step,
      });
    case actionTypes.SET_ISREMEMBER:
      return Object.assign({}, state, {
        isRemember: action.data,
      });
    case actionTypes.SET_PATH_NAME:
      return Object.assign({}, state, {
        pathName: action.data,
      });
    // case actionTypes.SET_ACCOUNT:
    //   return Object.assign({}, state, action.data);
    case actionTypes.SET_SHOW_PRIVATEKEY:
      return Object.assign({}, state, {
        showPrivateKey: action.data,
      });
    case actionTypes.SET_CONFIRM_MNEMONIC:
      return Object.assign({}, state, {
        confirmMnemonic: action.data,
      });
    default:
      return state;
  }
}

export default create;
