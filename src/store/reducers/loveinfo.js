import { actionTypes } from '../actions/loveinfo';

const initialState = {
  proposes: [],
  memories: [],
  topInfo: {},
};
const loveinfo = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.SET_TOPINFO:
      return { ...state, topInfo: action.data };
    case actionTypes.SET_LIKE_TOPINFO:
      return { ...state, topInfo: { ...state.topInfo, ...action.data } };
    case actionTypes.SET_PROPOSE:
      return { ...state, proposes: action.data };
    case actionTypes.ADD_PROPOSE:
      // eslint-disable-next-line no-case-declarations
      const isAdd = state.proposes.filter(item => item.id === action.data.id);
      return isAdd.length > 0 ? state : { ...state, proposes: [...state.proposes, action.data] };
    case actionTypes.CONFIRM_PROPOSE:
      // eslint-disable-next-line no-case-declarations
      const newProposes = state.proposes.map(el => {
        if (action.data.id === el.id) {
          return { ...el, ...action.data };
        }
        return el;
      });
      return { ...state, proposes: [...newProposes] };
    case actionTypes.SET_MEMORY:
      return { ...state, memories: action.data };
    default:
      return state;
  }
};

export default loveinfo;
