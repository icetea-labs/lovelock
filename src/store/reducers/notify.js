import { actionTypes } from '../actions/notify';

const initialState = {
  lockRequests: [],
  notifications: [],
};
const notify = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.SET_LOCKREQUEST:
      return { ...state, lockRequests: action.data };
    case actionTypes.SET_NOTIFICATION:
      return { ...state, notifications: action.data };
    default:
      return state;
  }
};

export default notify;
