import { Request, Response, NextFunction } from 'express';
import { swapService } from '../services/swap.service';
import { sendSuccess } from '../utils/response';

export class SwapController {
  async createChallenge(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await swapService.createChallenge(req.user!.userId, req.body);
      return sendSuccess(res, result, 201);
    } catch (err) {
      next(err);
    }
  }

  async replyChallenge(req: Request, res: Response, next: NextFunction) {
    try {
      const { challengeId } = req.params;
      const { replyReelId } = req.body;
      const result = await swapService.replyChallenge(req.user!.userId, challengeId, replyReelId);
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }

  async getUserChallenges(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await swapService.getUserChallenges(req.user!.userId);
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }

  async getDuetsFeed(req: Request, res: Response, next: NextFunction) {
    try {
      const cursor = req.query.cursor as string | undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
      const result = await swapService.getDuetsFeed(cursor, limit);
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }

  async getSwapDayMatch(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await swapService.getSwapDayMatch(req.user!.userId);
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }

  async saveSwapDayVibeNote(req: Request, res: Response, next: NextFunction) {
    try {
      const { matchId } = req.params;
      const { note } = req.body;
      const result = await swapService.saveSwapDayVibeNote(req.user!.userId, matchId, note);
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }
}

export const swapController = new SwapController();

