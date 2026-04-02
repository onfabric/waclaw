export enum AckEmoji {
  Default = '👀',
  Audio = '🎧',
  Image = '👓',
}

/**
 * Thinking emojis ordered by when they become available. Each tick unlocks the
 * next emoji on top of all previous ones. Early ticks have a small pool; the
 * longer it takes, the bigger (and weirder) the pool gets.
 */
const THINKING_EMOJIS = [
  '🧠', '🤔', '💭', '⏳', '✍️', '💡', '🔍',
  '⚙️', '🧩', '🔮', '🪄', '🎯', '🧪', '⚡',
  '🛠️', '🌀', '🔬', '🕵️', '🎲', '💫', '📡',
  '🏗️', '🧵', '🌐', '🐌', '🦥', '🫠', '👾',
  '🧊', '🪐', '🌋',
];

const INITIAL_POOL_SIZE = 7;

export function pickRandomThinkingEmoji(tick: number): string {
  const poolSize = Math.min(tick + INITIAL_POOL_SIZE, THINKING_EMOJIS.length);
  return THINKING_EMOJIS[Math.floor(Math.random() * poolSize)]!;
}
