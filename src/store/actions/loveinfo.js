/*
 * action types
 */
export const actionTypes = {
  SET_TOPINFO: 'SET_TOPINFO',
  SET_LIKE_TOPINFO: 'SET_LIKE_TOPINFO',
  SET_LOCKS: 'SET_LOCKS',
  ADD_LOCK: 'ADD_LOCK',
  CONFIRM_LOCK: 'CONFIRM_LOCK',
  SET_CURRENT_LOCK: 'SET_CURRENT_LOCK',
  SET_MEMORY: 'SET_MEMORY',
  SET_BLOG_VIEW: 'SET_BLOG_VIEW',
  UPDATE_BALANCES: 'UPDATE_BALANCES',
};
/*
 * action creators
 */
export const setLikeTopInfo = data => ({ type: actionTypes.SET_LIKE_TOPINFO, data });
export const setTopInfo = data => ({ type: actionTypes.SET_TOPINFO, data });
export const setLocks = data => ({ type: actionTypes.SET_LOCKS, data });
export const confirmLock = data => ({ type: actionTypes.CONFIRM_LOCK, data });
export const setCurrentLock = data => ({ type: actionTypes.SET_CURRENT_LOCK, data });
export const setMemory = data => ({ type: actionTypes.SET_MEMORY, data });
export const setBlogView = data => ({ type: actionTypes.SET_BLOG_VIEW, data });
export const updateBalances = data => ({ type: actionTypes.UPDATE_BALANCES, data });
