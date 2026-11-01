import http from 'http';
import { Server } from 'socket.io';
import app from './app';
import { config } from './config/env';
import { logger } from './config/logger';
import { connectDatabase, disconnectDatabase } from './config/database';
import { setupSocketServer } from './realtime/socket';
import { startWorkers } from './workers/videoWorker';

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const allowedOrigins = [
        config.webUrl,
        'http://localhost:3000',
        'http://localhost:3001',
        'http://127.0.0.1:3000',
      ];
      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith('.onrender.com') ||
        origin.endsWith('.vercel.app')
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST'],
  },
});

setupSocketServer(io);

async function bootstrap() {
  await connectDatabase();
  startWorkers();

  server.listen(config.port, '0.0.0.0', () => {
    logger.info(`⚡ Swap API Server listening on http://localhost:${config.port}`);
    logger.info(`📖 Interactive API Docs available at http://localhost:${config.port}/api/docs`);
    logger.info(`✨ Realtime WebSocket listening on ws://localhost:${config.port}`);
  });
}

bootstrap().catch((err) => {
  logger.error(err, 'Fatal server startup failure');
  process.exit(1);
});

// Graceful shutdown handling for Render / Docker container restarts
const gracefulShutdown = async (signal: string) => {
  logger.info(`Received ${signal}. Starting graceful shutdown of Swap server...`);
  server.close(async () => {
    logger.info('HTTP & WebSocket servers closed.');
    await disconnectDatabase();
    process.exit(0);
  });

  setTimeout(() => {
    logger.error('Graceful shutdown timed out, forcing exit.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

export { server, io };
