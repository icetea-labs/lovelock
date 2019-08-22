/*
 * action types
 */
export const actionTypes = {
  SET_USER_INFO: "SET_USER_INFO"
};
/*
 * action creators
 */
export const setUserInfo = data => ({ type: actionTypes.SET_USER_INFO, data });
