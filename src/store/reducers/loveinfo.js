import { actionTypes } from '../actions/loveinfo';

const initialState = {
  locks: [],
  memories: [],
  topInfo: {},
  blogView: {},
  balances: {},
  recentData: {}
};
const loveinfo = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.SET_TOPINFO:
      return { ...state, topInfo: action.data };
    case actionTypes.SET_LIKE_TOPINFO:
      return { ...state, topInfo: { ...state.topInfo, ...action.data } };
    case actionTypes.SET_LOCKS:
      return { ...state, locks: action.data };
    case actionTypes.CONFIRM_LOCK:
      // eslint-disable-next-line no-case-declarations
      const newLocks = state.locks.map(el => {
        if (action.data.id === el.id) {
          return { ...el, ...action.data };
        }
        return el;
      });
      return { ...state, locks: [...newLocks] };
    case actionTypes.SET_MEMORIES:
      return { ...state, memories: action.data };
    case actionTypes.UPDATE_MEMORY: {
      if (state.memories && state.memories.length) {
        const existing = state.memories.findIndex(m => m.id === action.data.id)
        if (existing >= 0) {
          state.memories[existing] = action.data;
        } else {
          state.memories.push(action.data);
        }
        return state
      }
      return { ...state, memories: [action.data] };
    }
    case actionTypes.SET_BLOG_VIEW:
      return { ...state, blogView: action.data };
    case actionTypes.UPDATE_BALANCES:
      return { ...state, balances: { ...state.balances, ...action.data } };
      case actionTypes.SET_RECENT_DATA:
        return { ...state, recentData: action.data || {} };
    default:
      return state;
  }
};

export default loveinfo;
