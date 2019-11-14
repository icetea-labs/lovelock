import { combineReducers } from 'redux';
import create from './create';
import account from './account';
import globalData from './globalData';
import loveinfo from './loveinfo';
import lovelock from './lovelock';

const myReducer = combineReducers({
  create,
  account,
  globalData,
  loveinfo,
  lovelock,
});

export default myReducer;
