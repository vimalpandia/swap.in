import { swapChallengeRepository } from '../repositories/swapChallenge.repository';
import { swapDayRepository } from '../repositories/swapDay.repository';
import { notificationRepository } from '../repositories/notification.repository';
import { SwapChallengeItem, SwapDayMatchItem } from '@swap/shared';
import { BadRequestError, NotFoundError } from '../utils/errors';

export class SwapService {
  async createChallenge(
    initiatorId: string,
    data: { prompt: string; recipientId: string; initiatorReelId: string }
  ): Promise<SwapChallengeItem> {
    if (initiatorId === data.recipientId) {
      throw new BadRequestError('Cannot send a swap challenge to yourself');
    }

    const challenge = await swapChallengeRepository.create({
      prompt: data.prompt,
      initiatorId,
      recipientId: data.recipientId,
      initiatorReelId: data.initiatorReelId,
    });

    // Notify recipient
    await notificationRepository.create({
      recipientId: data.recipientId,
      actorId: initiatorId,
      type: 'SWAP_CHALLENGE_INVITE',
      swapChallengeId: challenge.id,
      previewText: `Challenged you: "${data.prompt}"`,
    });

    return challenge;
  }

  async replyChallenge(
    recipientId: string,
    challengeId: string,
    replyReelId: string
  ): Promise<SwapChallengeItem> {
    const challenge = await swapChallengeRepository.findById(challengeId);
    if (!challenge) {
      throw new NotFoundError('Swap challenge not found');
    }

    if (challenge.recipient.id !== recipientId) {
      throw new BadRequestError('You are not the recipient of this challenge');
    }

    const updated = await swapChallengeRepository.reply(challengeId, recipientId, replyReelId);
    if (!updated) {
      throw new BadRequestError('Failed to complete swap challenge');
    }

    // Notify initiator
    await notificationRepository.create({
      recipientId: challenge.initiator.id,
      actorId: recipientId,
      type: 'SWAP_CHALLENGE_REPLIED',
      swapChallengeId: challenge.id,
      previewText: `Replied to your Swap Challenge! Check out the split-screen duet.`,
    });

    return updated;
  }

  async getUserChallenges(userId: string) {
    return swapChallengeRepository.getUserChallenges(userId);
  }

  async getDuetsFeed(cursor?: string, limit = 10) {
    return swapChallengeRepository.getDuetsFeed(cursor, limit);
  }

  // --- Swap Day ---

  async getSwapDayMatch(userId: string): Promise<SwapDayMatchItem | null> {
    return swapDayRepository.getDailyMatch(userId);
  }

  async saveSwapDayVibeNote(userId: string, matchId: string, note: string) {
    const success = await swapDayRepository.saveVibeNote(userId, matchId, note);
    if (!success) {
      throw new BadRequestError('Failed to record vibe note');
    }
    return { success: true };
  }
}

export const swapService = new SwapService();

