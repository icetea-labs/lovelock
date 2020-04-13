/*
 * action types
 */
export const actionTypes = {
  SET_GLOBAL_LOADING: 'SET_GLOBAL_LOADING',
  SET_NEW_LOCK: 'SET_NEW_LOCK',
  SET_CONFIRM_AUTH_ELE: 'SET_CONFIRM_AUTH_ELE',
  SET_LANGUAGE: 'SET_LANGUAGE',
  SET_NOTIFY_LOCK: 'SET_NOTIFY_LOCK',
};
/*
 * action creators
 */
export const setLoading = data => ({
  type: actionTypes.SET_GLOBAL_LOADING,
  data,
});
export const setNewLock = data => ({
  type: actionTypes.SET_NEW_LOCK,
  data,
});
export const setAuthEle = data => ({
  type: actionTypes.SET_CONFIRM_AUTH_ELE,
  data,
});
export const setLanguage = data => ({
  type: actionTypes.SET_LANGUAGE,
  data,
});
export const setNotifyLock = data => ({
  type: actionTypes.SET_NOTIFY_LOCK,
  data,
});
