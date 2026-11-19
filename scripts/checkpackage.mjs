// The packaging check (`pnpm check:package`, which `just ci-local` runs): packs @skonkwerks/patina as
// it would be published, and proves that the tarball works in an app that installs it.
//
// 1. Packs the package with `pnpm pack`, whose prepack script builds dist/. dist/ is removed first,
//    so the tarball can hold only the build that packing ran.
// 2. Lists the tarball. It fails on a file that must not ship (the source, a story, a spec, a story
//    helper, or anything beyond the build, the stylesheet, the README, the license and the
//    manifest), on a file missing (every exports target, patina.css, README.md, LICENSE), and on a
//    shipped module or declaration file whose relative import names a .ts or .tsx file, which does
//    not ship.
// 3. Installs the tarball with its peer dependencies into a throwaway app in the system's temporary
//    folder, outside the workspace so that nothing resolves through it, at the versions the
//    workspace has installed, from the pnpm store where it holds them and the registry otherwise
//    (as an app installs it: an offline install fails whenever a dependency of a peer resolves to
//    a version the store lacks). In that app it imports the package's entry in plain Node (no
//    bundler), checks that a path into the package (a family's folder name, or a file in dist/) is
//    refused, checks that each peer dependency resolves to the app's one copy from inside the
//    package, and type-checks a file that imports the entry under a strict
//    configuration (skipLibCheck off), with tsc and with tsgo (which the apps type-check with),
//    each once with moduleResolution bundler and once with nodenext.
// The temporary folder is removed when every check passes and kept, with its path printed, when one
// fails.
import { spawnSync } from 'node:child_process';
import {
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { createRequire } from 'node:module';
import os from 'node:os';
import path from 'node:path';

import ts from 'typescript';

const packageDir = path.join(import.meta.dirname, '..', 'packages', 'patina');
const PACKAGE_NAME = '@skonkwerks/patina';

/** The files outside dist/ that ship; each one must be in the tarball. */
const SHIPPED_FILES = ['package.json', 'README.md', 'LICENSE', 'patina.css'];
/** What the build writes into dist/: the modules, their declarations and their source maps. */
const BUILD_OUTPUT = /^dist\/.+\.(?:js|js\.map|d\.ts)$/u;
/** Files for Patina's own development, which never ship, whatever folder they are in. */
const DEVELOPMENT_ONLY = /\.(?:stories|spec|test|testing)\./u;
/** The shipped files whose imports an app resolves: the modules and their declarations. */
const SHIPPED_MODULE = /\.(?:js|d\.ts)$/u;
/** A relative import that names a TypeScript source file rather than the .js file the build writes. */
const TYPESCRIPT_SPECIFIER = /^\.{1,2}\/.*\.[cm]?tsx?$/u;
/** How many offending files a failure lists before it gives the count of the rest. */
const LISTED_FILES = 10;
/** How many lines of a failed command's output a failure shows before it gives the count of the rest. */
const SHOWN_LINES = 20;
/** The type packages the app installs, so that its type check can read React's types. */
const TYPE_PACKAGES = ['@types/react', '@types/react-dom'];

/** @type {string[]} */
const failures = [];

/** @param {string} message */
const fail = (message) => {
  failures.push(message);
  console.error(`FAIL ${message}`);
};

/** @param {string} message */
const pass = (message) => {
  console.log(`ok   ${message}`);
};

/**
 * @param {unknown} value
 * @returns {value is Record<string, unknown>}
 */
const isRecord = (value) =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/**
 * @param {string} file
 * @returns {unknown}
 */
const readJson = (file) => JSON.parse(readFileSync(file, 'utf8'));

/**
 * The version of a package as installed for packages/patina.
 * @param {string} name
 * @returns {string}
 */
const installedVersion = (name) => {
  const manifest = readJson(
    path.join(packageDir, 'node_modules', name, 'package.json'),
  );
  const version = isRecord(manifest) ? manifest.version : undefined;
  if (typeof version !== 'string') {
    throw new Error(`${name} is not installed in packages/patina.`);
  }
  return version;
};

/**
 * Every target an exports map names, at any depth of conditions.
 * @param {unknown} value
 * @returns {string[]}
 */
const exportTargets = (value) => {
  if (typeof value === 'string') {
    return [value];
  }
  return isRecord(value) ? Object.values(value).flatMap(exportTargets) : [];
};

/**
 * Runs a command to completion, with its output captured; a long output keeps its first lines.
 * @param {string} command
 * @param {string[]} args
 * @param {string} cwd
 * @returns {{ ok: boolean, output: string }}
 */
const run = (command, args, cwd) => {
  const result = spawnSync(command, args, { cwd, encoding: 'utf8' });
  const error = result.error ? `${result.error.message}\n` : '';
  const lines = `${error}${result.stdout}${result.stderr}`.trim().split('\n');
  const rest =
    lines.length > SHOWN_LINES
      ? [`... and ${lines.length - SHOWN_LINES} more lines`]
      : [];
  return {
    ok: result.status === 0,
    output: [...lines.slice(0, SHOWN_LINES), ...rest].join('\n'),
  };
};

/**
 * Every file under a folder, as a sorted list of '/'-separated paths relative to it.
 * @param {string} dir
 * @returns {string[]}
 */
const listFiles = (dir) =>
  readdirSync(dir, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) =>
      path
        .relative(dir, path.join(entry.parentPath, entry.name))
        .split(path.sep)
        .join('/'),
    )
    .sort();

/**
 * One failure for a set of files, naming the first few.
 * @param {string} what
 * @param {string[]} files
 */
const failFiles = (what, files) => {
  const listed = files.slice(0, LISTED_FILES).map((file) => `\n       ${file}`);
  const rest =
    files.length > LISTED_FILES
      ? `\n       and ${files.length - LISTED_FILES} more`
      : '';
  fail(`${what} (${files.length}):${listed.join('')}${rest}`);
};

/**
 * Ends the run: removes the temporary folder when every check passed, keeps it otherwise. Its type
 * is declared on the constant, so that a call to it ends control flow for the type checker.
 * @type {(workDir: string) => never}
 */
const finish = (workDir) => {
  if (failures.length > 0) {
    console.error(
      `\nThe packaging check failed (${failures.length}). The tarball and the app are in ${workDir}.`,
    );
    process.exit(1);
  }
  rmSync(workDir, { recursive: true, force: true });
  console.log('\nThe packaging check passed.');
  process.exit(0);
};

const workDir = mkdtempSync(path.join(os.tmpdir(), 'patina-package-'));

// 1. Pack. The prepack script builds dist/ from nothing.
rmSync(path.join(packageDir, 'dist'), { recursive: true, force: true });
const packed = run('pnpm', ['pack', '--pack-destination', workDir], packageDir);
const tarballName = readdirSync(workDir).find((name) => name.endsWith('.tgz'));
if (!packed.ok || tarballName === undefined) {
  fail(`pnpm pack failed:\n${packed.output}`);
  finish(workDir);
}
const tarball = path.join(workDir, tarballName);

// 2. List the tarball.
const unpackedDir = path.join(workDir, 'unpacked');
mkdirSync(unpackedDir);
const unpacked = run('tar', ['-xzf', tarball, '-C', unpackedDir], workDir);
if (!unpacked.ok) {
  fail(`could not unpack the tarball:\n${unpacked.output}`);
  finish(workDir);
}
const contentDir = path.join(unpackedDir, 'package');
const files = listFiles(contentDir);
const fileSet = new Set(files);
const manifest = readJson(path.join(contentDir, 'package.json'));
const exportsMap = isRecord(manifest) ? manifest.exports : undefined;

const unshippable = files.filter(
  (file) =>
    DEVELOPMENT_ONLY.test(path.posix.basename(file)) ||
    !(SHIPPED_FILES.includes(file) || BUILD_OUTPUT.test(file)),
);
if (unshippable.length > 0) {
  failFiles('the tarball holds files that must not ship', unshippable);
} else {
  pass(
    `the tarball holds nothing beyond dist/ and ${SHIPPED_FILES.join(', ')}`,
  );
}

const required = [
  ...new Set([
    ...SHIPPED_FILES,
    ...exportTargets(exportsMap).map((target) => path.posix.normalize(target)),
  ]),
];
const missing = required.filter((file) => !fileSet.has(file));
if (missing.length > 0) {
  failFiles('the tarball is missing files the package names', missing);
} else {
  pass(
    `the tarball holds every exports target and ${SHIPPED_FILES.join(', ')}`,
  );
}

// TypeScript's own scanner lists each file's imports, exports and import() types, never a comment.
const shippedModules = files.filter((file) => SHIPPED_MODULE.test(file));
const typescriptSpecifiers = shippedModules.flatMap((file) =>
  ts
    .preProcessFile(
      readFileSync(path.join(contentDir, file), 'utf8'),
      true,
      true,
    )
    .importedFiles.filter(({ fileName }) => TYPESCRIPT_SPECIFIER.test(fileName))
    .map(({ fileName }) => `${file}: ${fileName}`),
);
if (typescriptSpecifiers.length > 0) {
  failFiles(
    'shipped files import a .ts or .tsx file, which does not ship',
    typescriptSpecifiers,
  );
} else {
  pass(
    `no shipped module or declaration file imports a .ts or .tsx file (${shippedModules.length} files)`,
  );
}

const tarballBytes = statSync(tarball).size;
const unpackedBytes = files.reduce(
  (total, file) => total + statSync(path.join(contentDir, file)).size,
  0,
);
console.log(
  `     ${tarballName}: ${files.length} files, ${tarballBytes} bytes packed, ${unpackedBytes} bytes unpacked`,
);

// 3. Install the tarball into a throwaway app, at the versions the workspace has installed.
const peerDependencies = isRecord(manifest)
  ? manifest.peerDependencies
  : undefined;
const peerNames = Object.keys(
  isRecord(peerDependencies) ? peerDependencies : {},
);
/** @type {Record<string, string>} */
const dependencies = { [PACKAGE_NAME]: `file:${tarball}` };
for (const peer of peerNames) {
  dependencies[peer] = installedVersion(peer);
}
/** @type {Record<string, string>} */
const devDependencies = {};
for (const types of TYPE_PACKAGES) {
  devDependencies[types] = installedVersion(types);
}

const appDir = path.join(workDir, 'app');
mkdirSync(appDir);
writeFileSync(
  path.join(appDir, 'package.json'),
  `${JSON.stringify({ name: 'patina-app', private: true, type: 'module', dependencies, devDependencies }, null, 2)}\n`,
);
const installed = run('pnpm', ['install', '--prefer-offline'], appDir);
if (!installed.ok) {
  fail(`the app could not install the tarball:\n${installed.output}`);
  finish(workDir);
}
pass(`the app installed the tarball with ${peerNames.join(', ')}`);

const entries = Object.keys(isRecord(exportsMap) ? exportsMap : {})
  .filter((key) => !key.endsWith('.css'))
  .map((key) => path.posix.join(PACKAGE_NAME, key));
/** Paths into the package that the exports map must refuse: a family's name, and a built file. */
const refused = [`${PACKAGE_NAME}/button`, `${PACKAGE_NAME}/dist/index.js`];

// Plain Node: every entry imports, a path into the package is refused, and every peer is the app's
// one copy.
writeFileSync(
  path.join(appDir, 'node.mjs'),
  `import { realpathSync } from 'node:fs';
import { findPackageJSON } from 'node:module';

const entries = ${JSON.stringify(entries)};
const refused = ${JSON.stringify(refused)};
const peers = ${JSON.stringify(peerNames)};
const failures = [];

for (const entry of entries) {
  try {
    const module = await import(entry);
    if (Object.keys(module).length === 0) {
      failures.push(\`\${entry} exports nothing\`);
    }
  } catch (error) {
    failures.push(\`\${entry} does not import: \${error.message}\`);
  }
}

for (const path of refused) {
  try {
    await import(path);
    failures.push(\`\${path} imports, but the package offers no path into it\`);
  } catch (error) {
    if (error.code !== 'ERR_PACKAGE_PATH_NOT_EXPORTED') {
      failures.push(\`\${path} fails with \${error.code ?? error.message}, not as a path the package doesn't export\`);
    }
  }
}

const insidePackage = import.meta.resolve(entries[0]);
for (const peer of peers) {
  const fromApp = realpathSync(findPackageJSON(peer, import.meta.url));
  const fromPackage = realpathSync(findPackageJSON(peer, insidePackage));
  if (fromApp !== fromPackage) {
    failures.push(\`\${peer} is \${fromApp} in the app but \${fromPackage} in the package\`);
  }
}

if (failures.length > 0) {
  console.error(failures.join('\\n'));
  process.exit(1);
}
`,
);
const node = run(process.execPath, ['node.mjs'], appDir);
if (node.ok) {
  pass(
    `plain Node imports ${entries.join(', ')}, and refuses ${refused.join(' and ')}`,
  );
  pass(
    `${peerNames.join(', ')} each resolve to the app's one copy from inside the package`,
  );
} else {
  fail(`in plain Node:\n${node.output}`);
}

// The type check, under a strict app configuration with each module resolution.
writeFileSync(
  path.join(appDir, 'types.ts'),
  `${entries.map((entry, index) => `import * as entry${index} from '${entry}';`).join('\n')}

export const modules = [${entries.map((_entry, index) => `entry${index}`).join(', ')}];
`,
);
const require = createRequire(import.meta.url);
/** The type checkers, each run through its package's own bin script. */
const checkers = [
  {
    name: 'tsc',
    bin: path.join(
      path.dirname(require.resolve('typescript/package.json')),
      'bin',
      'tsc',
    ),
  },
  {
    name: 'tsgo',
    bin: path.join(
      path.dirname(require.resolve('@typescript/native-preview/package.json')),
      'bin',
      'tsgo',
    ),
  },
];
for (const [resolution, module] of [
  ['bundler', 'esnext'],
  ['nodenext', 'nodenext'],
]) {
  const config = `tsconfig.${resolution}.json`;
  writeFileSync(
    path.join(appDir, config),
    `${JSON.stringify(
      {
        compilerOptions: {
          target: 'ES2022',
          lib: ['ES2022', 'DOM', 'DOM.Iterable'],
          module,
          moduleResolution: resolution,
          jsx: 'react-jsx',
          strict: true,
          noUncheckedIndexedAccess: true,
          verbatimModuleSyntax: true,
          skipLibCheck: false,
          noEmit: true,
        },
        files: ['types.ts'],
      },
      null,
      2,
    )}\n`,
  );
  for (const checker of checkers) {
    const typed = run(process.execPath, [checker.bin, '-p', config], appDir);
    if (typed.ok) {
      pass(
        `${checker.name} type-checks ${entries.join(', ')} with moduleResolution ${resolution}, skipLibCheck off`,
      );
    } else {
      fail(
        `${checker.name} with moduleResolution ${resolution}:\n${typed.output}`,
      );
    }
  }
}

finish(workDir);
