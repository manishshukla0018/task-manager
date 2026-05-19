import * as authService from '../services/authService.js';
import { generateToken, getCookieOptions } from '../utils/generateToken.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/** Sets httpOnly cookie and returns the JWT (also sent in JSON for Authorization fallback). */
const issueAuth = (req, res, userId) => {
  const token = generateToken(userId);
  res.cookie('token', token, getCookieOptions(req));
  return token;
};

const clearTokenCookie = (req, res) => {
  const opts = getCookieOptions(req);
  res.clearCookie('token', {
    path: opts.path,
    httpOnly: opts.httpOnly,
    secure: opts.secure,
    sameSite: opts.sameSite,
  });
};

export const signup = asyncHandler(async (req, res) => {
  const user = await authService.register(req.body);

  const token = issueAuth(req, res, user._id);

  res.status(201).json({
    success: true,
    token,
    user: authService.formatUser(user),
  });
});

export const login = asyncHandler(async (req, res) => {
  const user = await authService.login(req.body);

  const token = issueAuth(req, res, user._id);

  res.json({
    success: true,
    data: {
      ...authService.formatUser(user),
      token,
    },
  });
});

export const logout = asyncHandler(async (req, res) => {
  clearTokenCookie(req, res);
  res.json({ success: true, message: 'Logged out successfully' });
});

export const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, data: authService.formatUser(req.user) });
});
