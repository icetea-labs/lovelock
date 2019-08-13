import { combineReducers } from "redux";
import chainInfo from "./chainInfo";
import globalData from "./globalData";

const myReducer = combineReducers({
  chainInfo,
  globalData
});

export default myReducer;
