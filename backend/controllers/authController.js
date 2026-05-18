import * as authService from '../services/authService.js';
import { generateToken, getCookieOptions } from '../utils/generateToken.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const setTokenCookie = (res, userId) => {
  res.cookie('token', generateToken(userId), getCookieOptions());
};

const clearTokenCookie = (res) => {
  res.cookie('token', '', { ...getCookieOptions(), maxAge: 0 });
};

export const signup = asyncHandler(async (req, res) => {
  const user = await authService.register(req.body);
  setTokenCookie(res, user._id);
  res.status(201).json({ success: true, data: authService.formatUser(user) });
});

export const login = asyncHandler(async (req, res) => {
  const user = await authService.login(req.body);
  setTokenCookie(res, user._id);
  res.json({ success: true, data: authService.formatUser(user) });
});

export const logout = asyncHandler(async (req, res) => {
  clearTokenCookie(res);
  res.json({ success: true, message: 'Logged out successfully' });
});

export const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, data: authService.formatUser(req.user) });
});
