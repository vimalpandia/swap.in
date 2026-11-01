import { Request, Response, NextFunction } from 'express';
import { commentService } from '../services/comment.service';
import { sendSuccess } from '../utils/response';

export class CommentController {
  async addComment(req: Request, res: Response, next: NextFunction) {
    try {
      const comment = await commentService.addComment(req.user!.userId, req.body);
      return sendSuccess(res, comment, 201);
    } catch (err) {
      next(err);
    }
  }

  async getComments(req: Request, res: Response, next: NextFunction) {
    try {
      const { postId, reelId, cursor, limit } = req.query;
      const result = await commentService.getComments({
        postId: postId as string,
        reelId: reelId as string,
        viewerId: req.user?.userId,
        cursor: cursor as string,
        limit: limit ? parseInt(limit as string, 10) : undefined,
      });
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }

  async toggleLike(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await commentService.toggleLike(req.user!.userId, id);
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await commentService.deleteComment(id, req.user!.userId);
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }
}

export const commentController = new CommentController();

