import { createStore, applyMiddleware } from "redux";
import { composeWithDevTools } from "redux-devtools-extension";
import rootReducer from "./reducers";
const exampleInitialState = {
  lastUpdate: 0
};
// const initializeStore = createStore(
//   rootReducer,
//   composeWithDevTools(applyMiddleware())
// );
// export default initializeStore;
export function initializeStore(initialState = exampleInitialState) {
  return createStore(
    rootReducer,
    initialState,
    composeWithDevTools(applyMiddleware())
  );
}
