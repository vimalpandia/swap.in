import app from './apps/api/src/app';
import { connectDatabase } from './apps/api/src/config/database';

/**
 * Vercel Serverless Function Handler for SWAP REST API.
 * Wraps the full Express 4 application into an ephemeral serverless execution context
 * with global MongoDB connection caching and route normalization.
 */
export default async function handler(req: any, res: any) {
  try {
    // 1. Ensure database connection is active (cached across warm function invocations)
    await connectDatabase();

    // 2. Normalize URL if routed through Vercel rewrites
    const matchedPath = req.headers['x-matched-path'] || req.headers['x-forwarded-uri'];
    if (matchedPath && typeof matchedPath === 'string' && (matchedPath.startsWith('/api/v1') || matchedPath.startsWith('/health'))) {
      req.url = matchedPath;
    }

    // 3. Delegate to Express app
    return app(req, res);
  } catch (err: any) {
    console.error('Unhandled Vercel Function error:', err);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVERLESS_FUNCTION_ERROR',
          message: 'Internal server error occurred in serverless function handler',
          timestamp: new Date().toISOString(),
        },
      });
    }
  }
}
