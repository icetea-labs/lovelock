import { actionTypes } from '../actions/loveinfo';

const initialState = {
  locks: [],
  memories: [],
  topInfo: {},
};
const loveinfo = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.SET_TOPINFO:
      return { ...state, topInfo: action.data };
    case actionTypes.SET_LIKE_TOPINFO:
      return { ...state, topInfo: { ...state.topInfo, ...action.data } };
    case actionTypes.SET_LOCKS:
      return { ...state, locks: action.data };
    case actionTypes.ADD_LOCK:
      // eslint-disable-next-line no-case-declarations
      const isAdd = state.locks.filter(item => item.id === action.data.id);
      return isAdd.length > 0 ? state : { ...state, locks: [...state.locks, action.data] };
    case actionTypes.CONFIRM_LOCK:
      // eslint-disable-next-line no-case-declarations
      const newLocks = state.locks.map(el => {
        if (action.data.id === el.id) {
          return { ...el, ...action.data };
        }
        return el;
      });
      return { ...state, locks: [...newLocks] };
    case actionTypes.SET_MEMORY:
      return { ...state, memories: action.data };
    default:
      return state;
  }
};

export default loveinfo;
