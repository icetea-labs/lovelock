/*
 * action types
 */
export const actionTypes = {
  SET_TOPINFO: 'SET_TOPINFO',
  SET_LIKE_TOPINFO: 'SET_LIKE_TOPINFO',
  SET_LOCK: 'SET_LOCK',
  ADD_LOCK: 'ADD_LOCK',
  CONFIRM_LOCK: 'CONFIRM_LOCK',
  SET_CURRENT_LOCK: 'SET_CURRENT_LOCK',
  SET_MEMORY: 'SET_MEMORY',
};
/*
 * action creators
 */
export const setLikeTopInfo = data => ({ type: actionTypes.SET_LIKE_TOPINFO, data });
export const setTopInfo = data => ({ type: actionTypes.SET_TOPINFO, data });
export const setLock = data => ({ type: actionTypes.SET_LOCK, data });
export const addLock = data => ({ type: actionTypes.ADD_LOCK, data });
export const confirmLock = data => ({ type: actionTypes.CONFIRM_LOCK, data });
export const setCurrentLock = data => ({ type: actionTypes.SET_CURRENT_LOCK, data });
export const setMemory = data => ({ type: actionTypes.SET_MEMORY, data });
