import axios from 'axios';

export const notiList = '/noti/list';
export const notiMark = '/noti/mark';

export const getAPI = async url => {
  const response = await axios.get(url, {
    headers: null,
  });
  return response;
};
