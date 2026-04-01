import type { createApp } from '#app.ts';

export enum SendMessageTypeEnum {
  text = 'text',
  reaction = 'reaction',
  audio = 'audio',
}

export type App = ReturnType<typeof createApp>;
