import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

/// The app owns the whole Pages site (main:docs/) except the custom-domain file.
export function isAllowedPublishPath(path) {
  return path.startsWith('docs/')
    && path !== 'docs/CNAME'
    && !path.split('/').includes('..');
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  const separator = process.argv.includes('--null') ? '\0' : '\n';
  const changedPaths = readFileSync(0, 'utf8')
    .split(separator)
    .filter((path) => path.length > 0);
  const unexpectedPaths = changedPaths.filter((path) => !isAllowedPublishPath(path));

  if (unexpectedPaths.length) {
    console.error('Unexpected publish paths:');
    for (const path of unexpectedPaths) console.error(path);
    process.exitCode = 1;
  }
}
