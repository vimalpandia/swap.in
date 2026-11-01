import mongoose from 'mongoose';
import { config } from './env';
import { logger } from './logger';

export async function connectDatabase(): Promise<typeof mongoose | null> {
  try {
    mongoose.set('strictQuery', true);
    const conn = await mongoose.connect(config.mongodbUri, {
      serverSelectionTimeoutMS: config.isProduction ? 8000 : 2500,
    });
    logger.info(`MongoDB connected successfully: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (err: any) {
    if (config.isDev) {
      try {
        const { MongoMemoryServer } = await import('mongodb-memory-server');
        const mongod = await MongoMemoryServer.create();
        const conn = await mongoose.connect(mongod.getUri());
        logger.info(`✅ Connected to local development MongoDB Memory Server: ${mongod.getUri()}`);
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
    await mongoose.disconnect();
    logger.info('MongoDB disconnected');
  } catch (err: any) {
    logger.error(`Error disconnecting MongoDB: ${err.message}`);
  }
}
