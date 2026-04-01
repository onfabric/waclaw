import { randomUUID } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { SendMessageTypeEnum } from '#client.ts';

const OPENCLAW_TMP_DIR = '/tmp/openclaw';

const UNKNOWN_EXT = '.bin';

const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'audio/aac': '.aac',
  'audio/mp4': '.m4a',
  'audio/mpeg': '.mp3',
  'audio/amr': '.amr',
  'audio/ogg': '.ogg',
  'audio/opus': '.opus',
  'audio/wav': '.wav',
};

const EXT_TO_MIME: Record<string, string> = {
  '.ogg': 'audio/ogg',
  '.opus': 'audio/ogg',
  '.mp3': 'audio/mpeg',
  '.m4a': 'audio/mp4',
  '.aac': 'audio/aac',
  '.amr': 'audio/amr',
  '.wav': 'audio/wav',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
};

type SendMediaType = SendMessageTypeEnum.audio | SendMessageTypeEnum.image;

export function resolveMediaSendType(mimeType: string): SendMediaType | undefined {
  if (mimeType.startsWith('audio/')) {
    return SendMessageTypeEnum.audio;
  }
  if (mimeType.startsWith('image/')) {
    return SendMessageTypeEnum.image;
  }
  return undefined;
}

export type MediaPayload = {
  base64Data: string;
  mimeType: string;
};

export function resolveMimeType(filePath: string): string | undefined {
  const ext = extname(filePath).toLowerCase();
  return EXT_TO_MIME[ext];
}

export async function readMediaFile(filePath: string): Promise<MediaPayload | undefined> {
  const mimeType = resolveMimeType(filePath);
  if (!mimeType) {
    return undefined;
  }
  const fileBuffer = await readFile(filePath);
  return { base64Data: fileBuffer.toString('base64'), mimeType };
}

export async function writeMediaToTempFile(params: {
  base64Data: string;
  mimeType: string;
}): Promise<string> {
  const { base64Data, mimeType } = params;
  const dir = join(OPENCLAW_TMP_DIR, `waclaw-media-${randomUUID()}`);
  await mkdir(dir, { recursive: true });
  const ext = MIME_TO_EXT[mimeType] ?? UNKNOWN_EXT;
  const filePath = join(dir, `media${ext}`);
  await writeFile(filePath, Buffer.from(base64Data, 'base64'));
  return filePath;
}
