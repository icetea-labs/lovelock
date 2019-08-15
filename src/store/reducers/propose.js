import { actionTypes } from "../actions/propose";

const initialState = {
  propose: []
};
const userInfo = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.SET_PROPOSE:
      return Object.assign({}, state, {
        propose: action.data
      });
    default:
      return state;
  }
};

export default userInfo;
