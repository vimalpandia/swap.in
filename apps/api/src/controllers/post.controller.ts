import { Request, Response, NextFunction } from 'express';
import { postService } from '../services/post.service';
import { sendSuccess } from '../utils/response';

export class PostController {
  async createPost(req: Request, res: Response, next: NextFunction) {
    try {
      const post = await postService.createPost(req.user!.userId, req.body);
      return sendSuccess(res, post, 201);
    } catch (err) {
      next(err);
    }
  }

  async getFeed(req: Request, res: Response, next: NextFunction) {
    try {
      const { cursor, limit, mood, followedOnly } = req.query;
      const feed = await postService.getFeed({
        viewerId: req.user?.userId,
        mood: mood as any,
        cursor: cursor as string,
        limit: limit ? parseInt(limit as string, 10) : undefined,
        followedOnly: followedOnly === 'true',
      });
      return sendSuccess(res, feed);
    } catch (err) {
      next(err);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const post = await postService.getPostById(id, req.user?.userId);
      return sendSuccess(res, post);
    } catch (err) {
      next(err);
    }
  }

  async toggleLike(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await postService.toggleLike(req.user!.userId, id);
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }

  async toggleSave(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await postService.toggleSave(req.user!.userId, id);
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await postService.deletePost(id, req.user!.userId);
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }
}

export const postController = new PostController();

