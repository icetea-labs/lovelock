import { combineReducers } from "redux";
import create from "./create";
import account from "./account";
import globalData from "./globalData";

const myReducer = combineReducers({
  create,
  account,
  globalData
});

export default myReducer;
