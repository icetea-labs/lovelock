/*
 * action types
 */
export const actionTypes = {
  SET_GLOBAL_LOADING: 'global/SET_GLOBAL_LOADING',
  SET_SHOW_NEW_LOCK_DIALOG: 'global/SET_SHOW_NEW_LOCK_DIALOG',
  SET_SHOW_PHOTO_VIEWER: 'global/SET_SHOW_PHOTO_VIEWER',
  SET_LANGUAGE: 'global/SET_LANGUAGE',
};
/*
 * action creators
 */
export const setLoading = data => ({
  type: actionTypes.SET_GLOBAL_LOADING,
  data,
});
export const setShowNewLockDialog = data => ({
  type: actionTypes.SET_SHOW_NEW_LOCK_DIALOG,
  data,
});
export const setShowPhotoViewer = data => ({
  type: actionTypes.SET_SHOW_PHOTO_VIEWER,
  data,
});
export const setLanguage = data => ({
  type: actionTypes.SET_LANGUAGE,
  data,
});
