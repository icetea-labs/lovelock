import axios from 'axios';

const instance = axios.create({
  baseURL: process.env.REACT_APP_ICETEAID,
  withCredentials: true,
})

export default instance;
