import { copyFileSync, existsSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const outDir = 'docs';
const source = join(outDir, 'index.html');


if (!existsSync(source)) {
  throw new Error(`Missing build entry: ${source}`);
}

copyFileSync(source, join(outDir, '404.html'));
writeFileSync(join(outDir, '.nojekyll'), '');
