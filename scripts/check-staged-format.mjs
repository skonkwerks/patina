// Checks the formatting of what is staged, not of the working copy: each staged file that Prettier
// formats is read from the index and must come out of Prettier unchanged. Run by .husky/pre-commit.
import { execFileSync } from 'node:child_process';
import path from 'node:path';

import * as prettier from 'prettier';

import { PRETTIER_EXTENSIONS } from './prettier-files.mjs';

const root = execFileSync('git', ['rev-parse', '--show-toplevel'], {
  encoding: 'utf8',
}).trim();
// The ignore files the Prettier CLI honors, so the hook and `pnpm format:check` skip the same paths.
const ignorePath = [
  path.join(root, '.prettierignore'),
  path.join(root, '.gitignore'),
];
const extensions = new Set(
  PRETTIER_EXTENSIONS.map((extension) => `.${extension}`),
);

// How much of one staged file `git show` may return. Node's default, 1 MiB, would fail the hook for
// a longer file; no file Prettier checks comes near this bound.
const MAX_STAGED_FILE_BYTES = 64 * 1024 * 1024;

const staged = execFileSync(
  'git',
  ['diff', '--cached', '--name-only', '--diff-filter=ACMR', '-z'],
  { cwd: root, encoding: 'utf8' },
)
  .split('\0')
  .filter((file) => file !== '' && extensions.has(path.extname(file)));

const unformatted = [];
for (const file of staged) {
  const filepath = path.join(root, file);
  const info = await prettier.getFileInfo(filepath, { ignorePath });
  if (info.ignored) {
    continue;
  }
  const content = execFileSync('git', ['show', `:${file}`], {
    cwd: root,
    encoding: 'utf8',
    maxBuffer: MAX_STAGED_FILE_BYTES,
  });
  const options = (await prettier.resolveConfig(filepath)) ?? {};
  if (!(await prettier.check(content, { ...options, filepath }))) {
    unformatted.push(file);
  }
}

if (unformatted.length > 0) {
  console.error(
    'pre-commit: these staged files are not formatted; run `pnpm format` and stage them again:',
  );
  for (const file of unformatted) {
    console.error(`  ${file}`);
  }
  process.exit(1);
}
