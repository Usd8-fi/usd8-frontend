import fs from 'node:fs';
import { gzipSync } from 'node:zlib';

const html = fs.readFileSync('docs/index.html', 'utf8');
const files = [...new Set([...html.matchAll(/(?:src|href)="\.\/([^"\s]+\.js)"/g)].map(match => match[1]))];
if (!files.length) throw new Error('No production entry scripts found.');
if (/mathjax/i.test(html)) throw new Error('MathJax must stay out of the app shell.');
const rawBytes = files.reduce((sum, file) => sum + fs.statSync(`docs/${file}`).size, 0);
const gzipBytes = files.reduce((sum, file) => sum + gzipSync(fs.readFileSync(`docs/${file}`)).length, 0);
console.log(JSON.stringify({ initialFiles: files.length, rawBytes, gzipBytes, baselineGzipBytes: 591616, reductionPercent: +(100 * (1 - gzipBytes / 591616)).toFixed(1) }, null, 2));
if (gzipBytes > 250000 || rawBytes > 800000) throw new Error('Initial JavaScript exceeds its performance budget.');
