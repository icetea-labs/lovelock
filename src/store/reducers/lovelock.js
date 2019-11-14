import { actionTypes } from '../actions/loveinfo';

const initialState = {
  Locks: [],
  memories: [],
  topInfo: {},
};
const lovelock = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.SET_TOPINFO:
      return { ...state, topInfo: action.data };
    case actionTypes.SET_LIKE_TOPINFO:
      return { ...state, topInfo: { ...state.topInfo, ...action.data } };
    case actionTypes.SET_LOCK:
      return { ...state, Locks: action.data };
    case actionTypes.ADD_LOCK:
      // eslint-disable-next-line no-case-declarations
      const isAdd = state.Locks.filter(item => item.id === action.data.id);
      return isAdd.length > 0 ? state : { ...state, Locks: [...state.Locks, action.data] };
    case actionTypes.CONFIRM_LOCK:
      // eslint-disable-next-line no-case-declarations
      const newLocks = state.Locks.map(el => {
        if (action.data.id === el.id) {
          return { ...el, ...action.data };
        }
        return el;
      });
      return { ...state, Locks: [...newLocks] };
    case actionTypes.SET_MEMORY:
      return { ...state, memories: action.data };
    default:
      return state;
  }
};

export default lovelock;
