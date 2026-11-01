import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

process.env.NODE_ENV = 'test';
process.env.PORT = '5001';
process.env.JWT_ACCESS_SECRET = 'test_access_secret_super_secure_key_at_least_32_chars!';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_super_secure_key_at_least_32_chars!';

let mongo: MongoMemoryServer;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  const uri = mongo.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (mongo) {
    await mongo.stop();
  }
});

afterEach(async () => {
  if (mongoose.connection.readyState !== 0) {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  }
});

jest.mock('../src/config/redis', () => {
  const store = new Map<string, string>();
  const setStore = new Map<string, Set<string>>();

  return {
    redisClient: {
      status: 'ready',
      get: jest.fn(async (key: string) => store.get(key) || null),
      set: jest.fn(async (key: string, val: string) => {
        store.set(key, val);
        return 'OK';
      }),
      setex: jest.fn(async (key: string, _ttl: number, val: string) => {
        store.set(key, val);
        return 'OK';
      }),
      del: jest.fn(async (...keys: string[]) => {
        keys.forEach((k) => store.delete(k));
        return keys.length;
      }),
      keys: jest.fn(async (pattern: string) => {
        return Array.from(store.keys()).filter((k) => k.startsWith(pattern.replace('*', '')));
      }),
      sadd: jest.fn(async (key: string, val: string) => {
        if (!setStore.has(key)) setStore.set(key, new Set());
        setStore.get(key)!.add(val);
        return 1;
      }),
      srem: jest.fn(async (key: string, val: string) => {
        setStore.get(key)?.delete(val);
        return 1;
      }),
    },
  };
});
