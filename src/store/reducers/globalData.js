import { actionTypes } from '../actions/globalData';

const initialState = {
  isLoading: false,
  showNotLoginNotify: false,
  triggerElement: null,
};

const globalData = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.SET_GLOBAL_LOADING:
      return { ...state, isLoading: action.data };
    case actionTypes.SET_CONFIRM_AUTH_ELE:
      return { ...state, triggerElement: action.data };
    // case types.SET_SHOW_PRIVATEKEY:
    //   return {
    //     ...state,
    //     triggerElement: action.data
    //   }
    default:
      return state;
  }
};

export default globalData;
