import app from '../apps/api/src/app';
import { connectDatabase } from '../apps/api/src/config/database';

/**
 * Vercel Serverless Function Handler for SWAP REST API.
 * Wraps the full Express 4 application into an ephemeral serverless execution context
 * with global MongoDB Atlas connection caching and route normalization.
 */
export default async function handler(req: any, res: any) {
  try {
    // 1. Ensure database connection is active (cached across warm function invocations)
    await connectDatabase();

    // 2. Normalize URL if routed through Vercel rewrites or query parameter
    const matchedPath =
      (req.query?.__path as string) ||
      req.headers['x-matched-path'] ||
      req.headers['x-forwarded-uri'];

    if (matchedPath && typeof matchedPath === 'string' && (matchedPath.startsWith('/api/v1') || matchedPath.startsWith('/v1') || matchedPath.startsWith('/health'))) {
      req.url = matchedPath;
    }

    // Direct root handler for API health inspection
    if (req.url === '/' || req.url === '/api') {
      return res.status(200).json({
        status: 'online',
        service: 'SWAP Serverless API Gateway',
        tagline: 'Swap moments. Swap vibes.',
        database: 'connected',
        timestamp: new Date().toISOString(),
      });
    }

    // 3. Delegate to Express app
    return app(req, res);
  } catch (err: any) {
    console.error('Unhandled Vercel Function error:', err.message);
    const isDbError = err.message && (err.message.includes('MongoDB') || err.message.includes('MONGODB_URI'));
    const statusCode = isDbError ? 503 : 500;
    const errorCode = isDbError ? 'DATABASE_CONNECTION_ERROR' : 'SERVERLESS_FUNCTION_ERROR';

    if (!res.headersSent) {
      res.status(statusCode).json({
        success: false,
        error: {
          code: errorCode,
          message: err.message || 'Internal server error occurred in serverless function handler',
          timestamp: new Date().toISOString(),
        },
      });
    }
  }
}
