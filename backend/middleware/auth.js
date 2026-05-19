import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import User from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';

function readToken(req) {
  if (req.cookies?.token) return req.cookies.token;
  const h = req.headers.authorization;
  if (h?.startsWith('Bearer ')) return h.slice(7).trim();
  return null;
}

export const protect = asyncHandler(async (req, res, next) => {
  const token = readToken(req);
  if (!token) throw new AppError('Not authorized. Please log in.', 401);

  try {
    const decoded = jwt.verify(token, env.jwtSecret);
    const user = await User.findById(decoded.id);
    if (!user) throw new AppError('User no longer exists.', 401);
    req.user = user;
    next();
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError('Invalid or expired token.', 401);
  }
});
