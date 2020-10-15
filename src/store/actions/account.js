/*
 * action types
 */
export const actionTypes = {
  SET_ACCOUNT: 'account/SET_ACCOUNT',
  SET_NEEDAUTH: 'account/SET_NEEDAUTH',
  SET_ISSYNC: 'account/SET_ISSYNC',
};
/*
 * action creators
 */
export const setAccount = data => ({
  type: actionTypes.SET_ACCOUNT,
  data,
});
export const setNeedAuth = data => ({
  type: actionTypes.SET_NEEDAUTH,
  data,
});
export const setIsSync = data => ({
  type: actionTypes.SET_ISSYNC,
  data,
});
