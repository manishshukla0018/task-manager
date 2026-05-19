/** Session token for Authorization header when httpOnly cookie is not sent (cross-origin / browser quirks). */
export const AUTH_TOKEN_KEY = 'ttm_token';

export const getStoredToken = () => localStorage.getItem('ttmToken');

export const setStoredToken = (token) => {
  localStorage.setItem('ttmToken', token);
};

export const clearStoredToken = () => {
  localStorage.removeItem('ttmToken');
};
