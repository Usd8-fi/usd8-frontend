import { copyFileSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const outDir = 'docs';
const source = join(outDir, 'index.html');
const documentationAssets = [
  'booster-600.webp',
  'booster-1200.webp',
  'my-avatar-200.webp',
  'my-avatar-400.webp',
  'tyche-300.webp',
  'tyche-600.webp',
  'murrayRothbard.jpg',
  'thomas_gresham.jpg',
  'usd8Logo.svg',
  'usdc.png',
];
const legacyDocumentationAssets = ['booster.png', 'my_avatar.png', 'tyche.png'];


if (!existsSync(source)) {
  throw new Error(`Missing build entry: ${source}`);
}

copyFileSync(source, join(outDir, '404.html'));
writeFileSync(join(outDir, '.nojekyll'), '');

const documentationAssetDir = join(outDir, 'assets');
mkdirSync(documentationAssetDir, { recursive: true });
for (const name of documentationAssets) {
  copyFileSync(join('src', 'assets', name), join(documentationAssetDir, name));
}
for (const name of legacyDocumentationAssets) {
  rmSync(join(documentationAssetDir, name), { force: true });
}
