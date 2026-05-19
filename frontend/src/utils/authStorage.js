/** Session token for Authorization header when httpOnly cookie is not sent (cross-origin / browser quirks). */
export const AUTH_TOKEN_KEY = 'ttm_token';

export const getStoredToken = () => sessionStorage.getItem(AUTH_TOKEN_KEY);

export const setStoredToken = (token) => {
  if (token) sessionStorage.setItem(AUTH_TOKEN_KEY, token);
  else sessionStorage.removeItem(AUTH_TOKEN_KEY);
};

export const clearStoredToken = () => sessionStorage.removeItem(AUTH_TOKEN_KEY);
