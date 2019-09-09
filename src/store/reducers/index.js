import { combineReducers } from 'redux';
import create from './create';
import account from './account';
import globalData from './globalData';
import loveinfo from './loveinfo';

const myReducer = combineReducers({
  create,
  account,
  globalData,
  loveinfo,
});

export default myReducer;
