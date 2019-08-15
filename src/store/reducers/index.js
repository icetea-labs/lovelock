import { combineReducers } from "redux";
import chainInfo from "./chainInfo";
import globalData from "./globalData";
import userInfo from "./userInfo";

const myReducer = combineReducers({
  chainInfo,
  globalData,
  userInfo
});

export default myReducer;
