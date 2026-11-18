// Writes the `exports` map of @skonkwerks/patina from its folders, so the map is never edited by
// hand: one subpath per public component family, named for the family, plus the stylesheet. Each
// family's subpath points at its build in dist/ (`pnpm build`), declarations first: the package
// ships the compiled JavaScript and its type definitions, never the source files (the source maps
// carry their text, for debugging).
// `--write` updates packages/patina/package.json (`pnpm exports`); `--check` fails when the map is
// stale (`pnpm check`). A family is a folder with an index.ts: at the root of src/ (a core family),
// or in aria/ or composites/. A family folder without its index.ts fails the run, in either mode,
// rather than exporting a subpath that would not resolve. internal/ is never exported.
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const packageDir = path.join(import.meta.dirname, '..', 'packages', 'patina');
const srcDir = path.join(packageDir, 'src');
const packageJsonPath = path.join(packageDir, 'package.json');
const TIERS = ['aria', 'composites'];
const NOT_A_FAMILY = new Set(['internal', ...TIERS]);

/**
 * The family folders directly under one folder of src/, as paths relative to src/.
 * @param {string} relative - The folder, relative to src/ ('' for src/ itself).
 * @returns {string[]}
 */
const familiesIn = (relative) =>
  readdirSync(path.join(srcDir, relative), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .filter((entry) => relative !== '' || !NOT_A_FAMILY.has(entry.name))
    .map((entry) => path.posix.join(relative, entry.name));

const [mode] = process.argv.slice(2);
if (mode !== '--write' && mode !== '--check') {
  console.error('usage: node scripts/exports.mjs --write | --check');
  process.exit(2);
}

const families = [...familiesIn(''), ...TIERS.flatMap(familiesIn)];
/** @type {Record<string, string | { types: string, default: string }>} */
const entries = {};
for (const family of families) {
  const name = path.posix.basename(family);
  if (!existsSync(path.join(srcDir, family, 'index.ts'))) {
    console.error(
      `packages/patina/src/${family} has no index.ts: every family folder needs one, which is its public surface.`,
    );
    process.exit(1);
  }
  if (name in entries) {
    console.error(
      `Two families are named "${name}"; a subpath must be unique.`,
    );
    process.exit(1);
  }
  entries[`./${name}`] = {
    types: `./dist/${family}/index.d.ts`,
    default: `./dist/${family}/index.js`,
  };
}
entries['./patina.css'] = './patina.css';
const exportsMap = Object.fromEntries(
  Object.entries(entries).sort(([a], [b]) => a.localeCompare(b)),
);

/** @type {unknown} */
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
if (
  typeof packageJson !== 'object' ||
  packageJson === null ||
  Array.isArray(packageJson)
) {
  console.error('packages/patina/package.json is not a JSON object.');
  process.exit(1);
}
const current = JSON.stringify(
  'exports' in packageJson ? packageJson.exports : undefined,
);
const expected = JSON.stringify(exportsMap);

if (mode === '--check') {
  if (current !== expected) {
    console.error(
      'packages/patina/package.json "exports" is out of date with the component folders: run pnpm exports.',
    );
    process.exit(1);
  }
} else if (current !== expected) {
  const updated = { ...packageJson, exports: exportsMap };
  writeFileSync(packageJsonPath, `${JSON.stringify(updated, null, 2)}\n`);
  console.log(`Wrote ${Object.keys(exportsMap).length} exports.`);
}
