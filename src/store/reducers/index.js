import { combineReducers } from "redux";
import chainInfo from "./chainInfo";
import globalData from "./globalData";
import userInfo from "./userInfo";
import propose from "./propose";
import create from "./create";

const myReducer = combineReducers({
  chainInfo,
  globalData,
  userInfo,
  propose,
  create
});

export default myReducer;
