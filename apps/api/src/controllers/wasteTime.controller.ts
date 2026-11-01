import { Request, Response, NextFunction } from 'express';
import { wasteTimeService } from '../services/wasteTime.service';
import { sendSuccess } from '../utils/response';

export class WasteTimeController {
  async getDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const dashboard = await wasteTimeService.getDashboard(req.user!.userId);
      return sendSuccess(res, dashboard);
    } catch (err) {
      next(err);
    }
  }

  async getFocusGuardStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const status = await wasteTimeService.getFocusGuardStatus(req.user!.userId);
      return sendSuccess(res, status);
    } catch (err) {
      next(err);
    }
  }

  async logTime(req: Request, res: Response, next: NextFunction) {
    try {
      const { reelId, durationSeconds } = req.body;
      const log = await wasteTimeService.logWatchTime(
        req.user!.userId,
        reelId || null,
        durationSeconds || 15
      );
      return sendSuccess(res, log);
    } catch (err) {
      next(err);
    }
  }
}

export const wasteTimeController = new WasteTimeController();

