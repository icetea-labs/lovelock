import { createStore, applyMiddleware, compose } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
// import { persistStore, persistReducer } from 'redux-persist';
// import storage from 'redux-persist/lib/storage';
// import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2';
// import thunk from 'redux-thunk';
import rootReducer from './reducers';

// const persistConfig = {
//   key: 'root',
//   storage,
//   stateReconciler: autoMergeLevel2,
// };
// const pReducer = persistReducer(persistConfig, rootReducer);
// export const store = createStore(pReducer);
export const persistor = {}; //persistStore(store);

const store = createStore(rootReducer, composeWithDevTools(compose(applyMiddleware())));
export { store };
export default store;
