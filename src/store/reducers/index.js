import { combineReducers } from 'redux';
import create from './create';
import account from './account';
import globalData from './globalData';
import propose from './propose';

const myReducer = combineReducers({
  create,
  account,
  globalData,
  propose,
});

export default myReducer;
