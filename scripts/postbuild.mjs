import { copyFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const outDir = 'docs';
const source = join(outDir, 'index.html');
const htmlRoutes = [
  'usd8.html',
  'philosophy.html',
  'cover-pool.html',
  'boosters.html',
  'white-hat-economy.html',
  'help-needed.html',
  'faqs.html',
  'contact.html',
  'dashboard.html',
  'print.html',
  '404.html',
];

if (!existsSync(source)) {
  throw new Error(`Missing build entry: ${source}`);
}

for (const route of htmlRoutes) {
  copyFileSync(source, join(outDir, route));
}
