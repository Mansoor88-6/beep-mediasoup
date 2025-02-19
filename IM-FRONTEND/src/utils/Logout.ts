import { BackendInstance, config } from 'config';

/**
 * Logs out a user from the backend and frontend
 * @returns {Promise<any>} Promise resolved on post request to logout api
 */
export const userLogout = async () => {
  /*
    Donot Include in try catch, calling function 
    will handle it
    */
  return await BackendInstance.post('user/logout', null, config);
};

/**
 * removes token cookie from session cookie
 *
 */
export const removeSecondaryToken = () => {
  /*
    Useful For Offline Logout
    */
  document.cookie = 'secondaryToken=null; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
};
