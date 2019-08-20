/*
 * action types
 */
export const actionTypes = {
  SET_ACCOUNT: 'account/SET_ACCOUNT',
  IMPORT_NEW_ACCOUNT: 'account/IMPORT_NEW_ACCOUNT',
  SET_NEEDAUTH: 'account/SET_NEEDAUTH',
};
/*
 * action creators
 */
export const setAccount = data => ({
  type: actionTypes.SET_ACCOUNT,
  data,
});
export const importNewAccount = data => ({
  type: actionTypes.IMPORT_NEW_ACCOUNT,
  data,
});
export const setNeedAuth = data => ({
  type: actionTypes.SET_NEEDAUTH,
  data,
});
