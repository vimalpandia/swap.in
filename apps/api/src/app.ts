import mongoose from 'mongoose';
import express, { Express } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import { config } from './config/env';
import { globalRateLimiter } from './middlewares/rateLimiter.middleware';
import { errorHandler } from './middlewares/error.middleware';
import apiRoutes from './routes';
import { swaggerDocument } from './docs/swagger';
import { sendSuccess } from './utils/response';

const app: Express = express();

// Trust proxy for Render / Cloudflare / reverse proxy deployments
app.set('trust proxy', 1);

// Security Middlewares
app.use(
  helmet({
    contentSecurityPolicy: false, // Allow inline styles & scripts for Swagger
    crossOriginEmbedderPolicy: false,
  })
);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow mobile apps, curl, server-to-server requests
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
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-refresh-token'],
  })
);

// Parsers
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Safe database & API health check endpoint (never exposes credentials or connection strings)
app.get(['/health', '/api/health'], async (_req, res) => {
  const dbStates: Record<number, string> = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };
  const dbReadyState = mongoose.connection.readyState;
  let isPingOk = false;
  let dbLatencyMs: number | null = null;

  if (dbReadyState === 1 && mongoose.connection.db) {
    try {
      const start = Date.now();
      await mongoose.connection.db.admin().ping();
      dbLatencyMs = Date.now() - start;
      isPingOk = true;
    } catch {
      isPingOk = false;
    }
  }

  const isHealthy = dbReadyState === 1 && isPingOk;

  return res.status(isHealthy ? 200 : 503).json({
    success: isHealthy,
    data: {
      status: isHealthy ? 'healthy' : 'degraded',
      service: 'Swap Social API',
      tagline: 'Swap moments. Swap vibes.',
      database: {
        status: dbStates[dbReadyState] || 'unknown',
        connected: dbReadyState === 1,
        ping: isPingOk ? 'pong' : 'failed',
        latencyMs: dbLatencyMs,
      },
      uptime: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
      environment: config.env,
    },
  });
});

// Rate Limiting
app.use('/api', globalRateLimiter);

// API Documentation
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// API Routes (supports /api/v1 as well as rewritten /v1 serverless paths)
app.use('/api/v1', apiRoutes);
app.use('/v1', apiRoutes);

// Centralized Error Handling
app.use(errorHandler);

export default app;
