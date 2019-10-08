/*
 * action types
 */
export const actionTypes = {
  SET_PROPOSE: 'SET_PROPOSE',
  ADD_PROPOSE: 'ADD_PROPOSE',
  CONFIRM_PROPOSE: 'CONFIRM_PROPOSE',
  SET_CURRENTIDX: 'SET_CURRENTIDX',
  SET_MEMORY: 'SET_MEMORY',
};
/*
 * action creators
 */
export const setPropose = data => ({ type: actionTypes.SET_PROPOSE, data });
export const addPropose = data => ({ type: actionTypes.ADD_PROPOSE, data });
export const confirmPropose = data => ({ type: actionTypes.CONFIRM_PROPOSE, data });
export const setCurrentIndex = data => ({ type: actionTypes.SET_CURRENTIDX, data });
export const setMemory = data => ({ type: actionTypes.SET_MEMORY, data });
