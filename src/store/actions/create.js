/*
 * action types
 */
export const actionTypes = {
  SET_STEP: "createAccount/SET_STEP",
  SET_PASSWORD: "createAccount/SET_PASSWORD",
  SET_ACCOUNT: "createAccount/SET_ACCOUNT",
  SET_SHOW_PRIVATEKEY: "createAccount/SET_SHOW_PRIVATEKEY",
  SET_CONFIRM_MNEMONIC: "createAccount/SET_CONFIRM_MNEMONIC"
};
// ET_SHOW_KEYSTORE_TEXT = 'createAccount/SET_SHOW_KEYSTORE_TEXT';
/*
 * action creators
 */
export const setStep = step => ({
  type: actionTypes.SET_STEP,
  step
});
export const setPassword = password => ({
  type: actionTypes.SET_PASSWORD,
  password
});
export const setAccount = data => ({
  type: actionTypes.SET_ACCOUNT,
  data
});
export const setShowPrivateKey = data => ({
  type: actionTypes.SET_SHOW_PRIVATEKEY,
  data
});
export const setConfirmMnemonic = data => ({
  type: actionTypes.SET_CONFIRM_MNEMONIC,
  data
});
