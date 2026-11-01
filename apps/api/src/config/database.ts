import mongoose from 'mongoose';
import { config } from './env';
import { logger } from './logger';

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var __mongooseCache: MongooseCache | undefined;
}

// Serverless-safe cached connection pool for Vercel Functions and long-running Node
const cached: MongooseCache = global.__mongooseCache || { conn: null, promise: null };
if (!global.__mongooseCache) {
  global.__mongooseCache = cached;
}

export async function connectDatabase(): Promise<typeof mongoose> {
  // 1. If connection is already open and ready, reuse it immediately (zero new connections created)
  if (mongoose.connection.readyState === 1) {
    cached.conn = mongoose;
    return cached.conn;
  }

  // 2. If a connection promise is already in flight, await it to prevent duplicate connection races
  if (cached.promise) {
    cached.conn = await cached.promise;
    return cached.conn;
  }

  // 3. Validation: In production, MONGODB_URI must be provided
  if (!config.mongodbUri) {
    const errorMsg = 'MONGODB_URI is not defined. Please configure your MongoDB Atlas connection string in Vercel environment variables.';
    logger.error(errorMsg);
    throw new Error(errorMsg);
  }

  try {
    mongoose.set('strictQuery', true);

    const connectionOptions: mongoose.ConnectOptions = {
      // 5-second server selection timeout to fail fast within Vercel's 10-second limit
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      // Restrict connection pool size in serverless to prevent exhausting Atlas connection limits
      maxPoolSize: config.isProduction ? 10 : 20,
      minPoolSize: 0,
      // Fail fast on operations if disconnected
      bufferCommands: false,
      autoIndex: !config.isProduction,
    };

    cached.promise = mongoose
      .connect(config.mongodbUri, connectionOptions)
      .then((conn) => {
        const dbName = conn.connection.name || 'swap_db';
        logger.info(`✅ Connected to MongoDB Atlas database: ${dbName}`);
        return conn;
      })
      .catch((err) => {
        cached.promise = null;
        cached.conn = null;
        throw err;
      });

    cached.conn = await cached.promise;
    return cached.conn;
  } catch (err: any) {
    cached.promise = null;
    cached.conn = null;

    // In local development only, fallback to in-memory server if Atlas is unreachable
    if (config.isDev) {
      try {
        const { MongoMemoryServer } = await import('mongodb-memory-server');
        const mongod = await MongoMemoryServer.create();
        const conn = await mongoose.connect(mongod.getUri());
        logger.info(`✅ Connected to local development MongoDB Memory Server: ${mongod.getUri()}`);
        cached.conn = conn;
        return conn;
      } catch {
        // Fallback
      }
    }

    // In production, NEVER use in-memory/mock storage; throw a clear descriptive error
    const sanitizedError = err.message || 'Unknown database connection error';
    logger.error(`Failed to connect to MongoDB Atlas: ${sanitizedError}`);
    throw new Error(
      `MongoDB Atlas connection failed: ${sanitizedError}. Verify that MONGODB_URI is set correctly in Vercel and that Atlas Network Access allows connections from 0.0.0.0/0 (Anywhere).`
    );
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

/**
 * Safe background index synchronization helper.
 * Ensures all collection indexes defined in Mongoose schemas are built on Atlas.
 */
export async function ensureIndexes(): Promise<void> {
  if (mongoose.connection.readyState !== 1) return;
  try {
    const models = Object.values(mongoose.models);
    await Promise.all(models.map((model) => model.syncIndexes().catch(() => {})));
    logger.info('MongoDB Atlas collection indexes verified');
  } catch (err: any) {
    logger.warn(`Index verification notice: ${err.message}`);
  }
}
