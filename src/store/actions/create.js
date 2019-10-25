/*
 * action types
 */
export const actionTypes = {
  SET_STEP: 'createAccount/SET_STEP',
  SET_PASSWORD: 'createAccount/SET_PASSWORD',
  SET_ISREMEMBER: 'createAccount/SET_ISREMEMBER',
  SET_SHOW_PRIVATEKEY: 'createAccount/SET_SHOW_PRIVATEKEY',
  SET_CONFIRM_MNEMONIC: 'createAccount/SET_CONFIRM_MNEMONIC',
  SET_PATH_NAME: 'createAccount/SET_PATH_NAME',
};
// ET_SHOW_KEYSTORE_TEXT = 'createAccount/SET_SHOW_KEYSTORE_TEXT';
/*
 * action creators
 */
export const setStep = step => ({
  type: actionTypes.SET_STEP,
  step,
});
export const setPassword = password => ({
  type: actionTypes.SET_PASSWORD,
  password,
});
export const setIsRemember = data => ({
  type: actionTypes.SET_ISREMEMBER,
  data,
});
export const setShowPrivateKey = data => ({
  type: actionTypes.SET_SHOW_PRIVATEKEY,
  data,
});
export const setConfirmMnemonic = data => ({
  type: actionTypes.SET_CONFIRM_MNEMONIC,
  data,
});
export const setPathName = data => ({
  type: actionTypes.SET_PATH_NAME,
  data,
});
