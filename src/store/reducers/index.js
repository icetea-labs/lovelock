import { combineReducers } from 'redux';
import chainInfo from './chainInfo';
import globalData from './globalData';
import userInfo from './userInfo';
import propose from './propose';
import create from './create';
import account from './account';

const myReducer = combineReducers({
  chainInfo,
  globalData,
  userInfo,
  propose,
  create,
  account,
});

export default myReducer;
