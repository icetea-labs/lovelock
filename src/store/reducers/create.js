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
    case actionTypes.SET_ACCOUNT:
      return Object.assign({}, state, action.data);
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
