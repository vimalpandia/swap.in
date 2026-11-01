import { Request, Response, NextFunction } from 'express';
import { capsuleService } from '../services/capsule.service';
import { sendSuccess } from '../utils/response';

export class CapsuleController {
  async createCapsule(req: Request, res: Response, next: NextFunction) {
    try {
      const capsule = await capsuleService.createCapsule(req.user!.userId, req.body);
      return sendSuccess(res, capsule, 201);
    } catch (err) {
      next(err);
    }
  }

  async getCapsules(req: Request, res: Response, next: NextFunction) {
    try {
      const capsules = await capsuleService.getCapsules(req.user!.userId);
      return sendSuccess(res, capsules);
    } catch (err) {
      next(err);
    }
  }
}

export const capsuleController = new CapsuleController();

