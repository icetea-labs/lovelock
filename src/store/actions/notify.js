/*
 * action types
 */
export const actionTypes = {
  SET_LOCKREQUEST: 'noti/SET_LOCKREQUEST',
  SET_NOTIFICATION: 'noti/SET_NOTIFICATION',
};
/*
 * action creators
 */
export const setLockReq = data => ({ type: actionTypes.SET_LOCKREQUEST, data });
export const setNoti = data => ({ type: actionTypes.SET_NOTIFICATION, data });
