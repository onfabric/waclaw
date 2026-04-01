import { randomUUID } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { extname, join } from 'node:path';

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

const EXT_TO_AUDIO_MIME: Record<string, string> = {
  '.ogg': 'audio/ogg',
  '.opus': 'audio/ogg',
  '.mp3': 'audio/mpeg',
  '.m4a': 'audio/mp4',
  '.aac': 'audio/aac',
  '.amr': 'audio/amr',
  '.wav': 'audio/wav',
};

export function resolveAudioMimeType(filePath: string): string | undefined {
  const ext = extname(filePath).toLowerCase();
  return EXT_TO_AUDIO_MIME[ext];
}

export type AudioPayload = {
  base64Data: string;
  mimeType: string;
};

export async function readAudioFile(filePath: string): Promise<AudioPayload | undefined> {
  const mimeType = resolveAudioMimeType(filePath);
  if (!mimeType) return undefined;
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
