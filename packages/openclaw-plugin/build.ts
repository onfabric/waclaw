import { copyFile, rm } from 'node:fs/promises';
import { join } from 'node:path';

const PLUGIN_DIR = import.meta.dir;
const ROOT_LICENSE_PATH = join(PLUGIN_DIR, '../..', 'LICENSE');

const PKG_DIR = join(PLUGIN_DIR, 'pkg');
const DIST_DIR = join(PKG_DIR, 'dist');
const LICENSE_DESTINATION_PATH = join(PKG_DIR, 'LICENSE');

await rm(DIST_DIR, {
  recursive: true,
  force: true,
});

await Bun.build({
  entrypoints: ['./src/index.ts', './src/setup-entry.ts'],
  outdir: DIST_DIR,
  target: 'node',
  external: ['openclaw'],
});

await copyFile(ROOT_LICENSE_PATH, LICENSE_DESTINATION_PATH);
