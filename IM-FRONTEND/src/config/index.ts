import axios from 'axios';
// eslint-disable-next-line no-process-env
export const env = process.env.REACT_APP_CUSTOM_ENVIRONMENT;
export const backendUrl = 'https://imvc-wj.averox.com';

export const BackendInstance = axios.create({
  baseURL: `${backendUrl}/api/`,
  withCredentials: true
});

export const config = {
  headers: {
    'Content-Type': ' application/json ' // application/x-www.form-urlencoded
  }
};
