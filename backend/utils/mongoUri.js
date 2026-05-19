/**
 * Normalizes MongoDB connection strings from .env (BOM, quotes, whitespace).
 * Returns null if empty or invalid scheme so callers can fall back to another source.
 */
export function parseMongoUri(raw, envVarName) {
  if (raw == null || typeof raw !== 'string') return null;

  let s = raw.replace(/^\uFEFF/, '').trim();
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    s = s.slice(1, -1).trim();
  }
  if (!s) return null;

  if (!s.startsWith('mongodb://') && !s.startsWith('mongodb+srv://')) {
    console.warn(
      `[env] ${envVarName} ignored — must start with mongodb:// or mongodb+srv:// (got: ${JSON.stringify(s.slice(0, 50))}...)`
    );
    return null;
  }

  return s;
}

function isNonEmpty(raw) {
  if (raw == null || typeof raw !== 'string') return false;
  return raw.replace(/^\uFEFF/, '').trim().length > 0;
}

const LOCAL_DEFAULT = 'mongodb://127.0.0.1:27017/team-task-manager';

/**
 * Valid MONGODB_URI_DIRECT (if set) wins; else valid MONGODB_URI; else local default.
 * If MONGODB_URI is non-empty but invalid, exit — avoids silent wrong DB.
 */
export function resolveMongoUri() {
  const rawDirect = process.env.MONGODB_URI_DIRECT;
  const rawMain = process.env.MONGODB_URI;

  const direct = parseMongoUri(rawDirect, 'MONGODB_URI_DIRECT');
  const primary = parseMongoUri(rawMain, 'MONGODB_URI');

  if (isNonEmpty(rawMain) && !primary) {
    console.error(`
[env] MONGODB_URI is set but is not a valid MongoDB URI.
      It must begin with mongodb:// or mongodb+srv://
      Fix .env or remove MONGODB_URI to use local: ${LOCAL_DEFAULT}
`);
    process.exit(1);
  }

  if (isNonEmpty(rawDirect) && !direct && primary) {
    console.warn('[env] MONGODB_URI_DIRECT invalid — using MONGODB_URI instead.');
  }

  return direct || primary || LOCAL_DEFAULT;
}
