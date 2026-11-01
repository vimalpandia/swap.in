import { Request, Response, NextFunction } from 'express';
import { userService } from '../services/user.service';
import { sendSuccess } from '../utils/response';

export class UserController {
  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const { username } = req.params;
      const profile = await userService.getProfile(username, req.user?.userId);
      return sendSuccess(res, profile);
    } catch (err) {
      next(err);
    }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await userService.updateProfile(req.user!.userId, req.body);
      return sendSuccess(res, updated);
    } catch (err) {
      next(err);
    }
  }

  async updateVibe(req: Request, res: Response, next: NextFunction) {
    try {
      const { vibe } = req.body;
      const updated = await userService.updateVibe(req.user!.userId, vibe);
      return sendSuccess(res, updated);
    } catch (err) {
      next(err);
    }
  }

  async follow(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const result = await userService.followUser(req.user!.userId, userId);
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }

  async unfollow(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const result = await userService.unfollowUser(req.user!.userId, userId);
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }

  async search(req: Request, res: Response, next: NextFunction) {
    try {
      const query = (req.query.q as string) || '';
      const results = await userService.search(query);
      return sendSuccess(res, results);
    } catch (err) {
      next(err);
    }
  }
}

export const userController = new UserController();
