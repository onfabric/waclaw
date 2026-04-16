import { cp, rm } from 'node:fs/promises';
import { join } from 'node:path';

const APP_DIR = import.meta.dir;
const DIST_DIR = join(APP_DIR, 'dist');
const MIGRATIONS_SRC = join(APP_DIR, 'src/db/migrations');
const MIGRATIONS_DST = join(DIST_DIR, 'migrations');
const SERVER_OUT = join(DIST_DIR, 'server');

console.log('🧹 Cleaning dist...');
await rm(DIST_DIR, { recursive: true, force: true });

console.log('🔨 Compiling binary...');
const buildResult = await Bun.build({
  entrypoints: ['./src/index.ts'],
  compile: { outfile: SERVER_OUT },
  minify: { whitespace: true, syntax: true },
  target: 'bun',
});

if (!buildResult.success) {
  console.error('❌ Build failed:', JSON.stringify(buildResult, null, 2));
  process.exit(1);
}

const built = buildResult.outputs
  .map((o) => `${o.path.replace(`${APP_DIR}/`, '')} (${(o.size / 1024 / 1024).toFixed(1)} MB)`)
  .join(', ');
console.log(`📦 Built: ${built}`);

console.log('📄 Copying migrations...');
await cp(MIGRATIONS_SRC, MIGRATIONS_DST, { recursive: true });

console.log('✅ Done');
