/*
 * action types
 */
export const actionTypes = {
  SET_ACCOUNT: 'account/SET_ACCOUNT',
  ADD_NEW_BANK_ACCOUNT: 'account/ADD_NEW_BANK_ACCOUNT',
  ADD_NEW_REGULAR_ACCOUNT: 'account/ADD_NEW_REGULAR_ACCOUNT',
  IMPORT_NEW_ACCOUNT: 'account/IMPORT_NEW_ACCOUNT',
  SET_BALANCE_CHILDKEY: 'account/SET_BALANCE_CHILDKEY',
  SET_USER_INFO: 'account/SET_USER_INFO',
  SET_NEEDAUTH: 'account/SET_NEEDAUTH',
  SET_WALLETCONNECT_URI: 'account/SET_WALLETCONNECT_URI',
};
/*
 * action creators
 */
export const setAccount = data => ({
  type: actionTypes.SET_ACCOUNT,
  data,
});
export const addBankAccount = data => ({
  type: actionTypes.ADD_NEW_BANK_ACCOUNT,
  data,
});
export const addRegularAccount = data => ({
  type: actionTypes.ADD_NEW_REGULAR_ACCOUNT,
  data,
});
export const importNewAccount = data => ({
  type: actionTypes.IMPORT_NEW_ACCOUNT,
  data,
});
export const setBalanceChildKey = data => ({
  type: actionTypes.SET_BALANCE_CHILDKEY,
  data,
});
export const setUserInfo = data => ({
  type: actionTypes.SET_USER_INFO,
  data,
});
export const setNeedAuth = data => ({
  type: actionTypes.SET_NEEDAUTH,
  data,
});
export const setWalletConUri = data => ({
  type: actionTypes.SET_WALLETCONNECT_URI,
  data,
});
