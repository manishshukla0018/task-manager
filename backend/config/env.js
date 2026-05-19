import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { resolveMongoUri } from '../utils/mongoUri.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../../.env') });

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  mongoUri: resolveMongoUri(),
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  /** Comma-separated extra allowed origins (preview deploys, second domain, etc.) */
  corsExtraOrigins: process.env.CORS_ORIGINS || '',
  isProduction: process.env.NODE_ENV === 'production',
};
