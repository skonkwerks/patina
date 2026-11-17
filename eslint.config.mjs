import js from '@eslint/js';
import comments from '@eslint-community/eslint-plugin-eslint-comments';
import prettier from 'eslint-config-prettier';
import importPlugin from 'eslint-plugin-import-x';
import reactDom from 'eslint-plugin-react-dom';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import reactX from 'eslint-plugin-react-x';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import globals from 'globals';
import tseslint from 'typescript-eslint';

/*
 * The full ESLint pass (`pnpm lint:es`); oxlint (`pnpm lint`) is the fast pass. Warnings fail the run
 * (`--max-warnings=0`). The shared lint rules
 * for a React project, without the application-only ones (TanStack, i18n), plus the aria package's
 * import rule.
 */

/** Import groups: side effects, Node built-ins, packages, workspace packages, relative paths. */
const importSortGroups = [
  ['^\\u0000'],
  ['^node:'],
  ['^@?\\w'],
  ['^@skonkwerks/'],
  ['^\\.'],
];

/** Paths lint never touches. */
const ignores = [
  '**/{node_modules,dist,build,storybook-static}/**',
  '.sessions/**',
  '.documents/**',
  '.scratch/**',
];

/** Import patterns that reach into another workspace's source (by package name or by a relative path). A workspace's own `./src` is not matched. */
const crossWorkspaceSource = [
  '@skonkwerks/*/src/**',
  '**/packages/*/src/**',
  '**/apps/*/src/**',
];

/** ARIA widget roles that React Aria Components implement; on a plain element they mean a hand-rolled control. */
const handRolledRoles = [
  'button',
  'link',
  'listbox',
  'option',
  'grid',
  'gridcell',
  'row',
  'rowgroup',
  'rowheader',
  'columnheader',
  'treegrid',
  'tree',
  'treeitem',
  'menu',
  'menubar',
  'menuitem',
  'menuitemcheckbox',
  'menuitemradio',
  'tab',
  'tablist',
  'tabpanel',
  'combobox',
  'slider',
  'spinbutton',
  'switch',
  'checkbox',
  'radio',
  'radiogroup',
  'dialog',
  'alertdialog',
  'tooltip',
  'progressbar',
  'meter',
  'searchbox',
  'textbox',
  'separator',
];

const noReactFC = {
  name: 'react',
  importNames: ['FC', 'FunctionComponent', 'VFC', 'VoidFunctionComponent'],
  message:
    'Type the props explicitly instead of using React.FC or FunctionComponent.',
};

/**
 * The aria hard rule: a wrapper imports React, React Aria Components, tailwind-variants and the
 * package's own files, and nothing else. `extra` adds the packages one kind of file may also use.
 * @param {string[]} extra
 * @returns {import('eslint').Linter.RuleEntry}
 */
const ariaImports = (extra = []) => {
  const allowed = [
    'react',
    'react-aria-components',
    'tailwind-variants',
    ...extra,
  ];
  return [
    'error',
    {
      patterns: [
        {
          group: crossWorkspaceSource,
          message: "A workspace never reaches into another workspace's source.",
        },
        {
          // Any package other than these; relative imports stay inside the package.
          regex: `^(?!\\.)(?!(${allowed.map((name) => name.replace('/', '\\/')).join('|')})(/.*)?$)`,
          message:
            '@skonkwerks/patina imports only React, React Aria Components, tailwind-variants and its own files (cn in util.ts adds clsx and tailwind-merge). See packages/aria/README.md.',
        },
      ],
      paths: [noReactFC],
    },
  ];
};

/** The rules every file holds, the root's scripts included. */
/** @type {import('eslint').Linter.RulesRecord} */
const baseRules = {
  // First, so that the rules below win over the formatting rules eslint-config-prettier turns off.
  ...prettier.rules,
  '@typescript-eslint/no-unused-vars': [
    'error',
    {
      vars: 'all',
      args: 'after-used',
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
      destructuredArrayIgnorePattern: '^_',
      caughtErrorsIgnorePattern: '^_',
    },
  ],
  // No casts; `as const` is not an assertion under this rule.
  '@typescript-eslint/consistent-type-assertions': [
    'error',
    { assertionStyle: 'never' },
  ],
  '@typescript-eslint/consistent-type-imports': [
    'error',
    { prefer: 'type-imports', disallowTypeAnnotations: false },
  ],
  'import-x/no-duplicates': 'error',
  // Relative imports carry their .ts or .tsx extension; the repository defines no path aliases.
  'import-x/extensions': [
    'error',
    'ignorePackages',
    { ts: 'always', tsx: 'always', js: 'never', jsx: 'never' },
  ],
  'import-x/no-unresolved': 'error',
  'no-restricted-imports': [
    'error',
    { patterns: crossWorkspaceSource, paths: [noReactFC] },
  ],
  // A suppression says why, after `--`.
  '@eslint-community/eslint-comments/require-description': 'error',
  curly: ['error', 'all'],
  'prefer-arrow-callback': ['error', { allowNamedFunctions: false }],
  'no-console': ['error', { allow: ['warn', 'error'] }],
  // A workspace imports another by its package name, never by a relative path into it.
  'import-x/no-relative-packages': 'error',
  'no-restricted-syntax': [
    'error',
    {
      selector: 'FunctionDeclaration',
      message: 'Use arrow functions or const function expressions instead.',
    },
    {
      selector: 'TSEnumDeclaration',
      message: 'Use a string literal union instead of an enum.',
    },
    {
      selector:
        'TSInterfaceDeclaration:not(TSModuleDeclaration TSInterfaceDeclaration)',
      message:
        'Use a type alias; an interface is only for module augmentation.',
    },
    {
      // React Aria first: an interactive widget role on a plain element is a hand-rolled control.
      selector: `JSXAttribute[name.name='role'][value.value=/^(${handRolledRoles.join('|')})$/]`,
      message:
        "Use the React Aria component for this control; a hand-rolled control needs the owner's approval.",
    },
  ],
  'simple-import-sort/imports': ['error', { groups: importSortGroups }],
  'simple-import-sort/exports': 'error',
};

/** The React workspaces' rules on top of the base. */
/** @type {import('eslint').Linter.RulesRecord} */
const rules = {
  ...baseRules,
  ...reactHooks.configs.recommended.rules,
  ...reactX.configs['recommended-typescript'].rules,
  ...reactDom.configs.recommended.rules,
  'react-refresh/only-export-components': [
    'error',
    { allowConstantExport: true },
  ],
  // Enforced together with noUncheckedIndexedAccess, which every React workspace's tsconfig sets.
  '@typescript-eslint/no-unnecessary-condition': 'error',
};

/**
 * The configuration for one workspace directory, typed by its own tsconfig.json.
 * @param {string} name - The workspace directory, relative to the repository root.
 * @param {string[]} [files] - Globs inside it, when not every TypeScript file.
 * @returns {import('typescript-eslint').ConfigWithExtends[]}
 */
const workspace = (name, files = [`${name}/**/*.{ts,tsx}`]) => [
  {
    files,
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommendedTypeChecked,
    ],
    languageOptions: {
      ecmaVersion: 'latest',
      globals: globals.browser,
      parser: tseslint.parser,
      parserOptions: {
        project: `./${name}/tsconfig.json`,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      '@eslint-community/eslint-comments': comments,
      'import-x': importPlugin,
      'simple-import-sort': simpleImportSort,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'react-x': reactX,
      'react-dom': reactDom,
    },
    settings: {
      'import-x/resolver': {
        typescript: {
          project: `./${name}/tsconfig.json`,
          alwaysTryTypes: true,
        },
        node: { extensions: ['.ts', '.tsx', '.js', '.jsx'] },
      },
    },
    rules,
  },
];

export default tseslint.config([
  { ignores },

  ...workspace('packages/aria'),
  ...workspace('apps/storybook', [
    'apps/storybook/.storybook/*.{ts,tsx}',
    'apps/storybook/vitest.config.ts',
  ]),

  // The root's scripts and configuration, which Node runs as they are written: the same base rules
  // as a workspace's code, typed through their JSDoc by the root tsconfig.json (`checkJs`).
  {
    files: ['*.mjs', 'scripts/**/*.mjs'],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommendedTypeChecked,
    ],
    languageOptions: {
      ecmaVersion: 'latest',
      globals: globals.node,
      parser: tseslint.parser,
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      '@eslint-community/eslint-comments': comments,
      'import-x': importPlugin,
      'simple-import-sort': simpleImportSort,
    },
    settings: {
      'import-x/resolver': {
        typescript: { project: './tsconfig.json', alwaysTryTypes: true },
        node: { extensions: ['.ts', '.tsx', '.js', '.jsx', '.mjs'] },
      },
    },
    // Scripts report to the terminal: the console is their output (typescript/style.md).
    rules: { ...baseRules, 'no-console': 'off' },
  },

  // The aria hard rule (packages/aria/README.md).
  {
    files: ['packages/aria/src/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ariaImports(),
      // The carve-out: a React Aria wrapper exports its `{component}Styles` beside it, so an app can
      // extend the look without forking it; every other component keeps its styles in a separate
      // file. Wrappers are not yet in a folder of their own, so for now the carve-out covers the
      // whole package; it narrows to the wrappers' folder when they are sorted into one.
      'react-refresh/only-export-components': 'off',
    },
  },
  // util.ts holds cn, the one place clsx and tailwind-merge are used.
  {
    files: ['packages/aria/src/util.ts'],
    rules: {
      'no-restricted-imports': ariaImports(['clsx', 'tailwind-merge']),
    },
  },
  // Specs are not shipped to apps; they may also use Vitest.
  {
    files: ['packages/aria/src/**/*.spec.ts'],
    rules: { 'no-restricted-imports': ariaImports(['vitest']) },
  },
  // Stories are not shipped to apps; they may also use Storybook's types.
  {
    files: ['packages/aria/src/**/*.stories.tsx'],
    rules: {
      'no-restricted-imports': ariaImports(['@storybook/react-vite']),
      // A story file exports its stories and its meta, which is what Storybook expects.
      'react-refresh/only-export-components': 'off',
    },
  },
  // Test files relax `any`, the unsafe family, and `require-await`, as in oxlint; the no-cast rule
  // still applies.
  {
    files: ['**/*.spec.ts', '**/*.spec.tsx', '**/*.test.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/require-await': 'off',
    },
  },
]);
