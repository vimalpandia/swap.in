import { Request, Response, NextFunction } from 'express';
import { streakService } from '../services/streak.service';
import { sendSuccess } from '../utils/response';

export class StreakController {
  async getMyStreaks(req: Request, res: Response, next: NextFunction) {
    try {
      const streaks = await streakService.getUserStreaks(req.user!.userId);
      return sendSuccess(res, streaks);
    } catch (err) {
      next(err);
    }
  }
}

export const streakController = new StreakController();

