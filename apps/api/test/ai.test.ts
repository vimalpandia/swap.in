import { aiService } from '../src/services/ai.service';

describe('AI Assist Service Tests', () => {
  it('should auto-generate creative caption, hashtags, and audio suggestion for CHILL mood', async () => {
    const result = await aiService.generateCaption('Sunset drive along the coastline', 'CHILL', ['coast', 'vibes']);

    expect(result.caption).toBeDefined();
    expect(result.caption.length).toBeGreaterThan(10);
    expect(result.hashtags).toBeDefined();
    expect(result.hashtags.some((h) => h.includes('chill') || h.includes('swap'))).toBe(true);
    expect(result.suggestedAudio).toContain('Lo-Fi');
  });

  it('should auto-generate witty caption and audio for FUNNY mood', async () => {
    const result = await aiService.generateCaption('Accidentally committed node_modules to Git', 'FUNNY');

    expect(result.caption).toBeDefined();
    expect(result.suggestedAudio).toContain('Meme');
  });

  it('should produce context-relevant smart reply suggestions for chat', async () => {
    const replies = await aiService.generateSmartReplies('Are you free to jump into a Watch Party tonight?');

    expect(replies).toBeDefined();
    expect(replies.length).toBeGreaterThanOrEqual(3);
    expect(replies.some((r) => r.includes('Party') || r.includes('Watch') || r.includes('in'))).toBe(true);
  });
});
