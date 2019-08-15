import { combineReducers } from "redux";
import chainInfo from "./chainInfo";
import globalData from "./globalData";
import userInfo from "./userInfo";
import propose from "./propose";

const myReducer = combineReducers({
  chainInfo,
  globalData,
  userInfo,
  propose
});

export default myReducer;
