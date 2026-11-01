import dotenv from 'dotenv';
import path from 'path';

// Load workspace .env as well as root .env if present
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const resolveMongoUri = (): string => {
  const rawUri = process.env.MONGODB_URI?.trim().replace(/^["']|["']$/g, '');
  if (rawUri) return rawUri;
  // In production, do not silently fallback to localhost 127.0.0.1
  if (process.env.NODE_ENV === 'production') {
    return '';
  }
  return 'mongodb://127.0.0.1:27017/swap_db';
};

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  apiUrl: process.env.API_URL || 'http://localhost:5000',
  webUrl: process.env.CLIENT_URL || process.env.WEB_URL || 'http://localhost:3000',

  mongodbUri: resolveMongoUri(),

  redis: {
    url: process.env.REDIS_URL,
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
  },

  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'swap_access_secret_super_secure_key_at_least_32_chars!',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'swap_refresh_secret_super_secure_key_at_least_32_chars!',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
  },

  llmApiKey: process.env.LLM_API_KEY || process.env.GEMINI_API_KEY || '',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
  isDev: process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test',
};
