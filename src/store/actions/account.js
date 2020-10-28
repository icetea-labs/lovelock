/*
 * action types
 */
export const actionTypes = {
  SET_ACCOUNT: 'account/SET_ACCOUNT',
  SET_NEEDAUTH: 'account/SET_NEEDAUTH',
  SET_TRYICETEAID: 'account/SET_TRYICETEAID',
};
/*
 * action creators
 */
export const setAccount = (data) => ({
  type: actionTypes.SET_ACCOUNT,
  data,
});
export const setNeedAuth = (data) => ({
  type: actionTypes.SET_NEEDAUTH,
  data,
});
export const setTryIceteaId = (data) => ({
  type: actionTypes.SET_TRYICETEAID,
  data,
});
