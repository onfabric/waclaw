import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const OPENCLAW_TMP_DIR = '/tmp/openclaw';

const UNKNOWN_EXT = '.bin';

const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
};

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
