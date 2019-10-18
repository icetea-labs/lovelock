import { actionTypes } from '../actions/loveinfo';

const initialState = {
  propose: [],
  memory: [],
};
const userInfo = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.SET_PROPOSE:
      return Object.assign({}, state, {
        propose: action.data,
      });
    case actionTypes.ADD_PROPOSE:
      // eslint-disable-next-line no-case-declarations
      const isAdd = state.propose.filter(item => item.id === action.data.id);
      return isAdd.length > 0 ? state : Object.assign({}, state, { propose: [...state.propose, action.data] });
    case actionTypes.CONFIRM_PROPOSE:
      // eslint-disable-next-line no-case-declarations
      const newProposes = state.propose.map(el => {
        if (action.data.id === el.id) {
          return Object.assign({}, el, action.data);
        }
        return el;
      });
      return Object.assign({}, state, { propose: [...newProposes] });
    case actionTypes.SET_MEMORY:
      return Object.assign({}, state, {
        memory: action.data,
      });
    default:
      return state;
  }
};

export default userInfo;
