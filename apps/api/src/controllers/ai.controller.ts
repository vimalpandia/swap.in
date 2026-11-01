import { Request, Response, NextFunction } from 'express';
import { aiService } from '../services/ai.service';
import { sendSuccess } from '../utils/response';

export class AIController {
  async generateCaption(req: Request, res: Response, next: NextFunction) {
    try {
      const { prompt, mood, tags } = req.body;
      const result = await aiService.generateCaption(prompt, mood, tags);
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }

  async generateSmartReplies(req: Request, res: Response, next: NextFunction) {
    try {
      const { incomingMessage } = req.body;
      const replies = await aiService.generateSmartReplies(incomingMessage);
      return sendSuccess(res, { replies });
    } catch (err) {
      next(err);
    }
  }
}

export const aiController = new AIController();

