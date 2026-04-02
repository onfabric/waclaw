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

export class ThinkingEmojiPicker {
  private tick = 0;
  private available = [...THINKING_EMOJIS];

  pick(): string {
    const poolSize = Math.min(this.tick + INITIAL_POOL_SIZE, this.available.length);

    // If we've used everything in the current pool, refill.
    if (poolSize === 0) {
      this.available = [...THINKING_EMOJIS];
      return this.pick();
    }

    const index = Math.floor(Math.random() * poolSize);
    const emoji = this.available[index]!;
    this.available.splice(index, 1);
    this.tick++;
    return emoji;
  }
}
