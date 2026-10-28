// Build only public frontend documents/assets for the existing Next deployment.
import { execFileSync } from 'node:child_process';
import { cp, mkdir, rm, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const npm = process.env.npm_execpath;
if (!npm) throw new Error('Run this build through npm so workspace dependencies resolve.');
execFileSync(process.execPath, [npm, 'run', 'build:next', '-w', '@donna/frontend'], {
  cwd: root,
  env: { ...process.env, DONNA_BUILD_TARGET: 'next' },
  stdio: 'inherit',
});

const source = join(root, 'frontend/lovable/dist/client');
const target = join(root, 'apps/web/public/donna');
const files = ['index.html', 'app/index.html', 'professional-contact/index.html', 'operaciones/index.html', 'donna-assets', 'favicon.svg'];
// Validate every required output before replacing the previous generated bundle.
await Promise.all(files.map(file => stat(join(source, file))));
await rm(target, { recursive: true, force: true });
await mkdir(target, { recursive: true });
for (const file of files) {
  await mkdir(join(target, file, '..'), { recursive: true });
  await cp(join(source, file), join(target, file), { recursive: true });
}
console.log('frontend: four documents and client assets ready for Next');
