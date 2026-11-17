// The files the repository formats with Prettier, defined once: the `format` and `format:check`
// scripts and the pre-commit format check all read it.

/** File extensions Prettier formats in this repository. */
export const PRETTIER_EXTENSIONS = [
  'ts',
  'tsx',
  'mjs',
  'cjs',
  'json',
  'md',
  'yaml',
  'yml',
  'css',
];

/** The glob of every formatted file; `.prettierignore` and `.gitignore` exclude the rest. */
export const PRETTIER_GLOB = `**/*.{${PRETTIER_EXTENSIONS.join(',')}}`;
