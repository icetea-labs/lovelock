import { actionTypes } from "../actions/globalData";

const initialState = {
  isLoading: false
};

const globalData = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.SET_GLOBAL_LOADING:
      return Object.assign({}, state, {
        isLoading: action.data
      });
    default:
      return state;
  }
};

export default globalData;
