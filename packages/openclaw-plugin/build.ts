import { copyFile, rm } from 'node:fs/promises';
import { join } from 'node:path';

const PLUGIN_DIR = import.meta.dir;
const ROOT_LICENSE_PATH = join(PLUGIN_DIR, '../..', 'LICENSE');

const PKG_DIR = join(PLUGIN_DIR, 'pkg');
const DIST_DIR = join(PKG_DIR, 'dist');
const LICENSE_DESTINATION_PATH = join(PKG_DIR, 'LICENSE');

console.log('🧹 Cleaning dist directory...');
await rm(DIST_DIR, {
  recursive: true,
  force: true,
});

console.log('🔨 Building plugin...');
const buildResult = await Bun.build({
  entrypoints: ['./src/index.ts', './src/setup-entry.ts'],
  outdir: DIST_DIR,
  target: 'node',
  external: ['openclaw'],
});

if (!buildResult.success) {
  console.error('❌ Build failed:', JSON.stringify(buildResult, null, 2));
  process.exit(1);
}

const entrypoints = buildResult.outputs
  .filter((o) => o.kind === 'entry-point')
  .map((o) => `${o.path.replace(`${PLUGIN_DIR}/`, '')} (${(o.size / 1024).toFixed(1)} kB)`);
console.log(`📦 Built files:\n${entrypoints.map((p) => `  ✓ ${p}`).join('\n')}`);

console.log('📄 Copying license...');
await copyFile(ROOT_LICENSE_PATH, LICENSE_DESTINATION_PATH);

console.log('✅ Done');
