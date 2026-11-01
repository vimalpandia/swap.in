import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { userService } from '../services/user.service';
import { sendSuccess } from '../utils/response';

const getCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: (process.env.NODE_ENV === 'production' ? 'none' : 'lax') as 'none' | 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
});

export class AuthController {
  async signup(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.signup(req.body);

      // Set httpOnly cookie for refresh token (supports cross-domain in production)
      res.cookie('refresh_token', result.tokens.refreshToken, getCookieOptions());

      return sendSuccess(res, result, 201);
    } catch (err) {
      next(err);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { login, password } = req.body;
      const result = await authService.login(login, password);

      res.cookie('refresh_token', result.tokens.refreshToken, getCookieOptions());

      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const token =
        req.cookies?.refresh_token ||
        req.body?.refreshToken ||
        (req.headers['x-refresh-token'] as string);

      const tokens = await authService.refresh(token);

      res.cookie('refresh_token', tokens.refreshToken, getCookieOptions());

      return sendSuccess(res, tokens);
    } catch (err) {
      next(err);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      if (req.user) {
        await authService.logout(req.user.userId);
      }
      res.clearCookie('refresh_token', getCookieOptions());
      return sendSuccess(res, { message: 'Logged out successfully' });
    } catch (err) {
      next(err);
    }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.forgotPassword(req.body.email);
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.resetPassword(req.body.token, req.body.newPassword);
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }

  async me(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return sendSuccess(res, { user: null });
      }
      const profile = await userService.getProfile(req.user.username, req.user.userId);
      return sendSuccess(res, { user: profile });
    } catch (err) {
      next(err);
    }
  }
}

export const authController = new AuthController();
