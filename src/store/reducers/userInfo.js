import { actionTypes } from "../actions/userInfo";

const initialState = {
  username: "hoanghuy",
  displayname: "anonymous",
  avata: "",
  avatarLarge: "",
  aboutMe: ""
};
const userInfo = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.SET_USER_INFO:
      return Object.assign({}, state, {
        ...action.data
      });
    default:
      return state;
  }
};

export default userInfo;
