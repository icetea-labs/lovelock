import { actionTypes } from '../actions/loveinfo';

const initialState = {
  propose: [],
  currentProIndex: 0,
  memory: [],
};
const userInfo = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.SET_PROPOSE:
      return Object.assign({}, state, {
        propose: action.data,
      });
    case actionTypes.ADD_PROPOSE:
      return Object.assign({}, state, { propose: [...state.propose, action.data] });
    case actionTypes.SET_CURRENTIDX:
      return Object.assign({}, state, {
        currentProIndex: action.data,
      });
    case actionTypes.SET_MEMORY:
      return Object.assign({}, state, {
        memory: action.data,
      });
    default:
      return state;
  }
};

export default userInfo;
