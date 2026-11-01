import { Request, Response, NextFunction } from 'express';
import { reelService } from '../services/reel.service';
import { sendSuccess } from '../utils/response';

export class ReelController {
  async createReel(req: Request, res: Response, next: NextFunction) {
    try {
      const reel = await reelService.createReel(req.user!.userId, req.body);
      return sendSuccess(res, reel, 201);
    } catch (err) {
      next(err);
    }
  }

  async getFeed(req: Request, res: Response, next: NextFunction) {
    try {
      const { cursor, limit, mood } = req.query;
      const feed = await reelService.getReelsFeed({
        viewerId: req.user?.userId,
        mood: mood as any,
        cursor: cursor as string,
        limit: limit ? parseInt(limit as string, 10) : undefined,
      });
      return sendSuccess(res, feed);
    } catch (err) {
      next(err);
    }
  }

  async logWatchTime(req: Request, res: Response, next: NextFunction) {
    try {
      const { reelId, watchDurationSeconds } = req.body;
      const result = await reelService.logWatchTime(req.user!.userId, reelId, watchDurationSeconds);
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }

  async toggleLike(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await reelService.toggleLike(req.user!.userId, id);
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }

  async toggleSave(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await reelService.toggleSave(req.user!.userId, id);
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }

  async respondToCollab(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { accept } = req.body;
      const result = await reelService.respondToCollab(req.user!.userId, id, accept);
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }
}

export const reelController = new ReelController();

