/*
 * action types
 */
export const actionTypes = {
  SET_GLOBAL_LOADING: "SET_GLOBAL_LOADING",
  SET_CONFIRM_AUTH_ELE: "SET_CONFIRM_AUTH_ELE"
};
/*
 * action creators
 */
export const setLoading = data => ({
  type: actionTypes.SET_GLOBAL_LOADING,
  data
});
export const setAuthEle = data => ({
  type: actionTypes.SET_CONFIRM_AUTH_ELE,
  data
});
