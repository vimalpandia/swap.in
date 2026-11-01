import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { config } from '../config/env';
import { sendSuccess } from '../utils/response';
import crypto from 'crypto';

const router = Router();

router.get('/signature', authenticate, (req: Request, res: Response, next: NextFunction) => {
  try {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const folder = 'swap_uploads';

    if (config.cloudinary.cloudName && config.cloudinary.apiSecret) {
      const paramsToSign = `folder=${folder}&timestamp=${timestamp}`;
      const signature = crypto
        .createHash('sha1')
        .update(paramsToSign + config.cloudinary.apiSecret)
        .digest('hex');

      return sendSuccess(res, {
        signature,
        timestamp,
        apiKey: config.cloudinary.apiKey,
        cloudName: config.cloudinary.cloudName,
        folder,
      });
    }

    // Dev/fallback mode when Cloudinary keys are not set yet
    return sendSuccess(res, {
      mock: true,
      timestamp,
      folder,
      message: 'Cloudinary environment variables not set; using local/client fallback',
    });
  } catch (err) {
    next(err);
  }
});

export default router;

