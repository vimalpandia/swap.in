import { Request, Response, NextFunction } from 'express';
import { storyService } from '../services/story.service';
import { sendSuccess } from '../utils/response';

export class StoryController {
  async createStory(req: Request, res: Response, next: NextFunction) {
    try {
      const story = await storyService.createStory(req.user!.userId, req.body);
      return sendSuccess(res, story, 201);
    } catch (err) {
      next(err);
    }
  }

  async getTray(req: Request, res: Response, next: NextFunction) {
    try {
      const tray = await storyService.getStoryTray(req.user?.userId);
      return sendSuccess(res, tray);
    } catch (err) {
      next(err);
    }
  }

  async recordView(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { reaction } = req.body;
      const result = await storyService.recordView(id, req.user!.userId, reaction);
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }

  async getViewers(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const viewers = await storyService.getStoryViewers(id, req.user!.userId);
      return sendSuccess(res, viewers);
    } catch (err) {
      next(err);
    }
  }
}

export const storyController = new StoryController();

