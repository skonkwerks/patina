// Runs Prettier over every formatted file: `--write` formats them (`pnpm format`), `--check` reports
// unformatted files without changing them (`pnpm format:check`). An optional directory narrows the
// run to the formatted files under it.
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import path from 'node:path';

import prettierPackage from 'prettier/package.json' with { type: 'json' };

import { PRETTIER_GLOB } from './prettier-files.mjs';

const [mode, scope] = process.argv.slice(2);
if (mode !== '--write' && mode !== '--check') {
  console.error('usage: node scripts/format.mjs --write | --check [directory]');
  process.exit(2);
}
const glob = scope
  ? `${scope.replace(/\/+$/u, '')}/${PRETTIER_GLOB}`
  : PRETTIER_GLOB;

const require = createRequire(import.meta.url);
// The CLI entry is the `bin` field of Prettier's own package.json, resolved against its directory.
const prettierBin = path.join(
  path.dirname(require.resolve('prettier/package.json')),
  prettierPackage.bin,
);

try {
  execFileSync(process.execPath, [prettierBin, mode, glob], {
    stdio: 'inherit',
  });
} catch (error) {
  // Prettier has already printed what failed; its exit status (1 for unformatted files, 2 for an
  // error such as an invalid configuration) is passed on unchanged.
  const status =
    typeof error === 'object' && error !== null && 'status' in error
      ? error.status
      : null;
  process.exit(typeof status === 'number' ? status : 1);
}
