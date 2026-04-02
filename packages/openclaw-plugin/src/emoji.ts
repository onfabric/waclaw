export enum AckEmoji {
  Default = '👀',
  Audio = '🎧',
  Image = '👓',
}

const THINKING_EMOJIS = ['🧠', '💭', '⏳', '🔍', '✍️', '💡', '⚙️', '🤔', '📝', '🔮'];

export function pickRandomThinkingEmoji(): string {
  return THINKING_EMOJIS[Math.floor(Math.random() * THINKING_EMOJIS.length)]!;
}
