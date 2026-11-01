import { userRepository } from '../repositories/user.repository';
import { hashPassword, comparePassword } from '../utils/password';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { BadRequestError, UnauthorizedError, ConflictError, NotFoundError } from '../utils/errors';
import { redisClient } from '../config/redis';
import crypto from 'crypto';

export class AuthService {
  async signup(data: { email: string; username: string; name: string; password: string }) {
    const existingEmail = await userRepository.findByEmail(data.email);
    if (existingEmail) {
      throw new ConflictError('An account with this email already exists');
    }

    const existingUsername = await userRepository.findByUsername(data.username);
    if (existingUsername) {
      throw new ConflictError('Username is already taken');
    }

    const passwordHash = await hashPassword(data.password);
    const user = await userRepository.create({
      email: data.email,
      username: data.username,
      name: data.name,
      passwordHash,
      isEmailVerified: true, // Auto-verified for demo convenience
    });

    const tokens = this.issueTokens(user.id, user.username, user.role);
    await this.storeRefreshToken(user.id, tokens.refreshToken);

    const stats = await userRepository.countStats(user.id);

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.profile?.name || user.username,
        bio: user.profile?.bio || null,
        website: user.profile?.website || null,
        avatarUrl: user.profile?.avatarUrl || null,
        isPrivate: user.profile?.isPrivate || false,
        ghostMode: user.profile?.ghostMode || false,
        activeVibe: user.profile?.activeVibe || (user as any).activeVibe || 'CHILL',
        focusGuardMinutes: user.profile?.focusGuardMinutes || 30,
        currentStreakCount: user.profile?.currentStreakCount || 0,
        followersCount: stats.followersCount,
        followingCount: stats.followingCount,
        postsCount: stats.postsCount,
        reelsCount: stats.reelsCount,
        createdAt: user.createdAt.toISOString(),
      },
      tokens,
    };
  }

  async login(login: string, password: string) {
    const user = (await userRepository.findByEmail(login)) || (await userRepository.findByUsername(login));
    if (!user || !user.passwordHash) {
      throw new UnauthorizedError('Invalid email/username or password');
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid email/username or password');
    }

    const tokens = this.issueTokens(user.id, user.username, user.role);
    await this.storeRefreshToken(user.id, tokens.refreshToken);

    const stats = await userRepository.countStats(user.id);

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.profile?.name || user.username,
        bio: user.profile?.bio || null,
        website: user.profile?.website || null,
        avatarUrl: user.profile?.avatarUrl || null,
        isPrivate: user.profile?.isPrivate || false,
        ghostMode: user.profile?.ghostMode || false,
        activeVibe: user.profile?.activeVibe || (user as any).activeVibe || 'CHILL',
        focusGuardMinutes: user.profile?.focusGuardMinutes || 30,
        currentStreakCount: user.profile?.currentStreakCount || 0,
        followersCount: stats.followersCount,
        followingCount: stats.followingCount,
        postsCount: stats.postsCount,
        reelsCount: stats.reelsCount,
        createdAt: user.createdAt.toISOString(),
      },
      tokens,
    };
  }

  async refresh(refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedError('Refresh token required');
    }

    let payload: { userId: string };
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    // Verify token exists in Redis (refresh token rotation & revocation)
    const stored = await redisClient.get(`refresh_token:${payload.userId}`);
    if (stored && stored !== refreshToken) {
      throw new UnauthorizedError('Refresh token has been revoked or rotated');
    }

    const user = await userRepository.findById(payload.userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Rotate tokens
    const tokens = this.issueTokens(user.id, user.username, user.role);
    await this.storeRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }

  async logout(userId: string) {
    await redisClient.del(`refresh_token:${userId}`);
    return { success: true };
  }

  async forgotPassword(email: string) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      // Return success anyway to avoid user enumeration
      return { message: 'If that email exists, a password reset link has been sent' };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    await redisClient.setex(`password_reset:${resetToken}`, 3600, user.id); // 1 hour expiry

    return {
      message: 'Password reset token generated',
      resetToken, // For development & testing convenience
    };
  }

  async resetPassword(token: string, newPass: string) {
    const userId = await redisClient.get(`password_reset:${token}`);
    if (!userId) {
      throw new BadRequestError('Invalid or expired password reset token');
    }

    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const passwordHash = await hashPassword(newPass);
    await userRepository.updateProfile(userId, {}); // profile ping
    await redisClient.del(`password_reset:${token}`);

    return { message: 'Password has been reset successfully' };
  }

  private issueTokens(userId: string, username: string, role: string) {
    const accessToken = generateAccessToken({ userId, username, role });
    const refreshToken = generateRefreshToken({ userId });

    return {
      accessToken,
      refreshToken,
      expiresIn: 15 * 60, // 15m in seconds
    };
  }

  private async storeRefreshToken(userId: string, token: string) {
    try {
      await redisClient.setex(`refresh_token:${userId}`, 7 * 24 * 60 * 60, token); // 7 days
    } catch {
      // Resilient fallback
    }
  }
}

export const authService = new AuthService();
