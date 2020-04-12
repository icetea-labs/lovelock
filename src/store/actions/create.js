/*
 * action types
 */
export const actionTypes = {
  SET_STEP: 'createAccount/SET_STEP',
  SET_ISREMEMBER: 'createAccount/SET_ISREMEMBER',
  SET_PATH_NAME: 'createAccount/SET_PATH_NAME',
};

/*
 * action creators
 */
export const setStep = step => ({
  type: actionTypes.SET_STEP,
  step,
});
export const setIsRemember = data => ({
  type: actionTypes.SET_ISREMEMBER,
  data,
});
export const setPathName = data => ({
  type: actionTypes.SET_PATH_NAME,
  data,
});
