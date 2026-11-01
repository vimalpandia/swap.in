import mongoose from 'mongoose';
import { config } from './env';
import { logger } from './logger';

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose | null> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var __mongooseCache: MongooseCache | undefined;
}

// Serverless-safe cached connection pool for Vercel Functions and persistent Node
const cached: MongooseCache = global.__mongooseCache || { conn: null, promise: null };
if (!global.__mongooseCache) {
  global.__mongooseCache = cached;
}

export async function connectDatabase(): Promise<typeof mongoose | null> {
  // If already connected, reuse connection immediately (avoids exhausting Atlas connection limits)
  if (mongoose.connection.readyState === 1) {
    cached.conn = mongoose;
    return cached.conn;
  }

  // If a connection promise is already in flight, await it to prevent duplicate connection races
  if (cached.promise) {
    cached.conn = await cached.promise;
    return cached.conn;
  }

  try {
    mongoose.set('strictQuery', true);
    cached.promise = mongoose
      .connect(config.mongodbUri, {
        serverSelectionTimeoutMS: config.isProduction ? 8000 : 2500,
        bufferCommands: false,
      })
      .then((conn) => {
        logger.info(`MongoDB connected successfully: ${conn.connection.host}/${conn.connection.name}`);
        return conn;
      })
      .catch((err) => {
        cached.promise = null;
        throw err;
      });

    cached.conn = await cached.promise;
    return cached.conn;
  } catch (err: any) {
    cached.promise = null;
    if (config.isDev) {
      try {
        const { MongoMemoryServer } = await import('mongodb-memory-server');
        const mongod = await MongoMemoryServer.create();
        const conn = await mongoose.connect(mongod.getUri());
        logger.info(`✅ Connected to local development MongoDB Memory Server: ${mongod.getUri()}`);
        cached.conn = conn;
        return conn;
      } catch {
        // Fallback to warning
      }
    }
    logger.warn(`MongoDB connection warning: ${err.message}. Running in resilient mode.`);
    return null;
  }
}

export async function disconnectDatabase(): Promise<void> {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      cached.conn = null;
      cached.promise = null;
      logger.info('MongoDB disconnected');
    }
  } catch (err: any) {
    logger.error(`Error disconnecting MongoDB: ${err.message}`);
  }
}
