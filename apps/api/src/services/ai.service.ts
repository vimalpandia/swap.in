import { config } from '../config/env';
import { MoodType } from '@swap/shared';

export class AIService {
  async generateCaption(prompt: string, mood?: MoodType, tags?: string[]): Promise<{
    caption: string;
    hashtags: string[];
    suggestedAudio: string;
  }> {
    // If LLM API Key is configured and valid, call Google Gemini / LLM (skip in tests)
    if (!config.isTest && config.llmApiKey && config.llmApiKey !== 'mock-gemini-key') {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${config.llmApiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: `You are the creative AI assistant for "Swap", a cutting-edge social media app ("Swap moments. Swap vibes."). 
Generate a catchy, modern Instagram/TikTok-style caption, 4 trending hashtags, and a mood-matching audio title for:
Theme: "${prompt}".
Mood: "${mood || 'CHILL'}".
Tags: "${(tags || []).join(', ')}".
Return strictly valid JSON with keys: "caption" (string), "hashtags" (array of strings with #), "suggestedAudio" (string).`,
                    },
                  ],
                },
              ],
            }),
          }
        );

        if (response.ok) {
          const data = (await response.json()) as any;
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
            const parsed = JSON.parse(cleaned);
            return parsed;
          }
        }
      } catch {
        // Fallback gracefully to smart heuristic generator
      }
    }

    // High quality context-aware generator fallback
    const moodPrefixes: Record<string, string[]> = {
      CHILL: ['Late night frequencies 🌙', 'Golden hour serenity ✨', 'Unplugged and vibing 🌊'],
      FUNNY: ['Nobody: ... Me at 3 AM: 💀', 'Task failed successfully 😂', 'Certified waste of time ⏱️'],
      MOTIVATED: ['Shipping mode: ACTIVE ⚡', 'Discipline over motivation 🚀', 'Brick by brick 🧱'],
      CURIOUS: ['Into the unknown 🌌', 'What happens if we push this further? 🔍', 'Neo Tokyo vibes 🎨'],
    };

    const prefix = mood && moodPrefixes[mood]
      ? moodPrefixes[mood][Math.floor(Math.random() * moodPrefixes[mood].length)]
      : 'Swapping moments ⚡';

    const cleanPrompt = prompt.replace(/[^\w\s]/gi, '').trim();
    const caption = `${prefix} — ${prompt}. Building in public and swapping the vibe.`;

    const hashtags = [
      '#swap',
      `#${(mood || 'vibes').toLowerCase()}`,
      `#${cleanPrompt.split(' ')[0] || 'visuals'}`.toLowerCase(),
      '#wasteoftime',
    ];

    const audioOptions: Record<string, string> = {
      CHILL: 'Swap Lo-Fi - Midnight Rain',
      FUNNY: 'Meme Speedrun 140 BPM',
      MOTIVATED: 'Cyberpunk Synthwave - Overdrive',
      CURIOUS: 'Ambient Tape Loops Vol. 1',
    };

    const suggestedAudio = (mood && audioOptions[mood]) || 'Original Swap Audio';

    return {
      caption,
      hashtags,
      suggestedAudio,
    };
  }

  async generateSmartReplies(incomingMessage: string): Promise<string[]> {
    const text = incomingMessage.toLowerCase();

    if (text.includes('?')) {
      return [
        'Count me in! 🙌',
        'Let me check and get right back to you!',
        'Definitely, let’s do it 🔥',
      ];
    }

    if (text.includes('party') || text.includes('reel') || text.includes('watch') || text.includes('swap')) {
      return [
        'Joining right now! 🍿',
        'Sent you a Swap Duet! 🎥',
        'That reel was pure fire 😭',
      ];
    }

    if (text.includes('hi') || text.includes('hey') || text.includes('yo')) {
      return [
        'Hey! What vibe are you on today? ✨',
        'Yo! Did you check out the new reel drop? 🚀',
        'Hey there! 👋',
      ];
    }

    return [
      'Love that vibe! ✨',
      'Facts 💯',
      'Sending you a swap challenge! 🤝',
    ];
  }
}

export const aiService = new AIService();
