// Writes the one entry of @skonkwerks/patina from its folders, so neither is edited by hand:
// src/index.ts, which re-exports every public component family, and the `exports` map, which
// offers that entry (`.`) and the stylesheet, and nothing else. An app imports everything from
// `@skonkwerks/patina`, as it imports React Aria Components from `react-aria-components`, and never
// sees how the package is laid out; a path into the package is refused by the map. The entry points
// at its build in dist/ (`pnpm build`), declarations first: the package ships the compiled
// JavaScript and its type definitions, never the source files (the source maps carry their text,
// for debugging).
// `--write` updates src/index.ts and packages/patina/package.json (`pnpm exports`); `--check` fails
// when either is stale (`pnpm check`). A family is a folder with an index.ts: at the root of src/
// (a core family), or in aria/ or composites/. A family folder without its index.ts fails the run,
// in either mode, rather than re-exporting a module that would not resolve. internal/ is never
// exported.
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const packageDir = path.join(import.meta.dirname, '..', 'packages', 'patina');
const srcDir = path.join(packageDir, 'src');
const packageJsonPath = path.join(packageDir, 'package.json');
const indexPath = path.join(srcDir, 'index.ts');
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
/**
 * The families by name, so two folders of one name in different tiers fail the run.
 * @type {Map<string, string>}
 */
const byName = new Map();
for (const family of families) {
  const name = path.posix.basename(family);
  if (!existsSync(path.join(srcDir, family, 'index.ts'))) {
    console.error(
      `packages/patina/src/${family} has no index.ts: every family folder needs one, which is its public surface.`,
    );
    process.exit(1);
  }
  if (byName.has(name)) {
    console.error(
      `Two families are named "${name}"; a family's name must be unique.`,
    );
    process.exit(1);
  }
  byName.set(name, family);
}
// In the order of their paths, as ESLint's export sorting keeps them.
const sorted = [...byName.entries()].sort(([, a], [, b]) =>
  a.localeCompare(b, 'en'),
);
const index = `// Written by scripts/exports.mjs (\`pnpm exports\`) from the component families' folders; never
// edited by hand. The package's one entry: every public family, re-exported.
${sorted.map(([, family]) => `export * from './${family}/index.js';`).join('\n')}
`;
const exportsMap = {
  '.': { types: './dist/index.d.ts', default: './dist/index.js' },
  './patina.css': './patina.css',
};

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

const currentIndex = existsSync(indexPath)
  ? readFileSync(indexPath, 'utf8')
  : undefined;

if (mode === '--check') {
  const stale = [
    ...(current === expected ? [] : ['packages/patina/package.json "exports"']),
    ...(currentIndex === index ? [] : ['packages/patina/src/index.ts']),
  ];
  if (stale.length > 0) {
    console.error(
      `${stale.join(' and ')} out of date with the component folders: run pnpm exports.`,
    );
    process.exit(1);
  }
} else {
  if (current !== expected) {
    const updated = { ...packageJson, exports: exportsMap };
    writeFileSync(packageJsonPath, `${JSON.stringify(updated, null, 2)}\n`);
    console.log('Wrote the exports map: the entry and the stylesheet.');
  }
  if (currentIndex !== index) {
    writeFileSync(indexPath, index);
    console.log(`Wrote src/index.ts: ${String(sorted.length)} families.`);
  }
}
