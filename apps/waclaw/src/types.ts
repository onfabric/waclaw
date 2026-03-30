import type { createApp } from '#app.ts';

export enum SendMessageTypeEnum {
  text = 'text',
  reaction = 'reaction',
}

export type App = ReturnType<typeof createApp>;
