import { copyFile, rm } from 'node:fs/promises';
import { join } from 'node:path';

const PLUGIN_DIR = import.meta.dir;
const ROOT_LICENSE_PATH = join(PLUGIN_DIR, '../..', 'LICENSE');

const PKG_DIR = join(PLUGIN_DIR, 'pkg');
const DIST_DIR = join(PKG_DIR, 'dist');
const LICENSE_DESTINATION_PATH = join(PKG_DIR, 'LICENSE');

console.log('Cleaning dist directory...');
await rm(DIST_DIR, {
  recursive: true,
  force: true,
});

console.log('Building plugin...');
await Bun.build({
  entrypoints: ['./src/index.ts', './src/setup-entry.ts'],
  outdir: DIST_DIR,
  target: 'node',
  external: ['openclaw'],
});

console.log('Copying license...');
await copyFile(ROOT_LICENSE_PATH, LICENSE_DESTINATION_PATH);

console.log('Done');
