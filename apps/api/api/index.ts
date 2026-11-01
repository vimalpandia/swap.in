import app from '../src/app';
import { connectDatabase } from '../src/config/database';

/**
 * Standalone Vercel Serverless Function Handler for apps/api.
 * Enables deploying the Express backend as an independent Vercel project if desired.
 */
export default async function handler(req: any, res: any) {
  try {
    await connectDatabase();

    const matchedPath = req.headers['x-matched-path'] || req.headers['x-forwarded-uri'];
    if (matchedPath && typeof matchedPath === 'string' && (matchedPath.startsWith('/api/v1') || matchedPath.startsWith('/health'))) {
      req.url = matchedPath;
    }

    return app(req, res);
  } catch (err: any) {
    console.error('Unhandled Vercel Function error in apps/api:', err);
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
