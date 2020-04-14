import { actionTypes } from '../actions/create';

const initialState = {
  step: 'one',
  isRemember: window.localStorage.remember !== '0',
  pathName: '',
};

function create(state = initialState, action) {
  switch (action.type) {
    case actionTypes.SET_STEP:
      return { ...state, step: action.step };
    case actionTypes.SET_ISREMEMBER: {
      const boolValue = !!action.data;
      window.localStorage.remember = boolValue ? '1' : '0';
      return { ...state, isRemember: boolValue };
    }
    case actionTypes.SET_PATH_NAME:
      return { ...state, pathName: action.data };
    default:
      return state;
  }
}

export default create;
