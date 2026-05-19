import cors from 'cors';
import { env } from './env.js';

/**
 * Builds allowed browser origins for CORS + credentialed cookies.
 * Set CLIENT_URL to your real frontend origin(s), comma-separated, no trailing slash.
 * Optional CORS_ORIGINS for extra preview URLs.
 */
function buildAllowedOrigins() {
  const set = new Set([
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:4173',
    'http://127.0.0.1:4173',
  ]);

  const merge = (csv) => {
    if (!csv) return;
    for (const part of String(csv).split(',')) {
      const s = part.trim().replace(/\/$/, '');
      if (s) set.add(s);
    }
  };

  merge(env.clientUrl);
  merge(env.corsExtraOrigins);

  // Railway / hosting: public URL often not the same string as CLIENT_URL — allow common envs
  merge(process.env.PUBLIC_APP_URL);
  merge(process.env.RAILWAY_STATIC_URL);
  const rpd = process.env.RAILWAY_PUBLIC_DOMAIN?.trim();
  if (rpd) {
    const normalized = rpd.startsWith('http') ? rpd : `https://${rpd}`;
    merge(normalized);
  }

  return set;
}

const allowedOrigins = buildAllowedOrigins();

if (env.isProduction) {
  console.log(
    '[CORS] Allowed origins:',
    [...allowedOrigins].join(', ') || '(none — set CLIENT_URL on the server)'
  );
}

export const corsMiddleware = cors({
  origin(origin, callback) {
    // Same-origin / server-to-server / curl — no Origin header
    if (!origin) {
      return callback(null, true);
    }

    const normalized = origin.replace(/\/$/, '');
    if (allowedOrigins.has(normalized)) {
      return callback(null, true);
    }

    console.warn(
      `[CORS] Blocked Origin: ${origin}. Set CLIENT_URL (or CORS_ORIGINS) on the server to this exact URL.`
    );
    return callback(null, false);
  },
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
});
