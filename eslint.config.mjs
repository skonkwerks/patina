import comments from '@eslint-community/eslint-plugin-eslint-comments';
import js from '@eslint/js';
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
 * The lint pass (`pnpm lint`). Warnings fail the run (`--max-warnings=0`). The shared lint rules
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
  '.documents/guidelines/general/**',
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

/** @type {import('eslint').Linter.RulesRecord} */
const rules = {
  // First, so that the rules below win over the formatting rules eslint-config-prettier turns off.
  ...prettier.rules,
  ...reactHooks.configs.recommended.rules,
  ...reactX.configs['recommended-typescript'].rules,
  ...reactDom.configs.recommended.rules,
  'react-refresh/only-export-components': [
    'error',
    { allowConstantExport: true },
  ],
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
  '@typescript-eslint/no-unnecessary-condition': 'error',
  'import-x/no-duplicates': 'error',
  // Relative imports carry their .ts or .tsx extension; the repository defines no path aliases.
  'import-x/extensions': [
    'error',
    'ignorePackages',
    { ts: 'always', tsx: 'always', js: 'never', jsx: 'never' },
  ],
  'import-x/no-unresolved': 'error',
  'no-restricted-imports': ['error', { paths: [noReactFC] }],
  // A suppression says why, after `--`.
  '@eslint-community/eslint-comments/require-description': 'error',
  curly: ['error', 'all'],
  'prefer-arrow-callback': ['error', { allowNamedFunctions: false }],
  'no-console': ['error', { allow: ['warn', 'error'] }],
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
  ...workspace('apps/storybook', ['apps/storybook/.storybook/*.{ts,tsx}']),

  // The aria hard rule (packages/aria/README.md).
  {
    files: ['packages/aria/src/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ariaImports(),
      // A component file also exports its `{component}Styles`, so an app can extend the look
      // without forking the component. That costs only a full reload instead of a hot update when
      // the file is edited in development.
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
  // Stories are not shipped to apps; they may also use Storybook's types.
  {
    files: ['packages/aria/src/**/*.stories.tsx'],
    rules: {
      'no-restricted-imports': ariaImports(['@storybook/react-vite']),
      // A story file exports its stories and its meta, which is what Storybook expects.
      'react-refresh/only-export-components': 'off',
    },
  },
]);
