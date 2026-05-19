import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export const generateToken = (userId) =>
  jwt.sign({ id: userId }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });

/**
 * httpOnly JWT cookie options.
 *
 * - **Same-origin** (SPA and API share one host, e.g. Railway monolith): `SameSite=Lax` + `Secure`
 *   works for credentialed `fetch`/`axios` to `/api`.
 * - **Cross-origin** (UI on Vercel, API on Railway): need `SameSite=None` + `Secure` or the browser
 *   will not send the cookie on XHR.
 */
export const getCookieOptions = (req) => {
  const base = {
    httpOnly: true,
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };

  if (!env.isProduction) {
    return { ...base, secure: false, sameSite: 'lax' };
  }

  const origin = req?.get?.('origin');
  const host = req?.get?.('host');
  let crossSite = false;

  if (origin && host) {
    try {
      const originHost = new URL(origin).host;
      crossSite = originHost !== host;
    } catch {
      crossSite = true;
    }
  }

  return {
    ...base,
    secure: true,
    sameSite: crossSite ? 'none' : 'lax',
  };
};
