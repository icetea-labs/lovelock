import { actionTypes } from "../actions/propose";

const initialState = {
  propose: [],
  currentProIndex: 0
};
const userInfo = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.SET_PROPOSE:
      return Object.assign({}, state, {
        propose: action.data
      });
    case actionTypes.SET_CURRENTIDX:
      return Object.assign({}, state, {
        currentProIndex: action.data
      });
    default:
      return state;
  }
};

export default userInfo;
