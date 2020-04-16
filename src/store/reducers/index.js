import { combineReducers } from 'redux';
import create from './create';
import account from './account';
import globalData from './globalData';
import loveinfo from './loveinfo';
import notify from './notify';

const myReducer = combineReducers({
  create,
  account,
  globalData,
  loveinfo,
  notify,
});

export default myReducer;
