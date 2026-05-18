import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export const generateToken = (userId) =>
  jwt.sign({ id: userId }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });

export const getCookieOptions = () => ({
  httpOnly: true,
  secure: env.isProduction,
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/',
});
