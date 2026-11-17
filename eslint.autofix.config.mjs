import tseslint from 'typescript-eslint';

import { ignores, importSortGroups, reactPlugins } from './eslint.config.mjs';

/*
 * The only configuration `eslint --fix` runs with (`pnpm lint:fix`). It fixes import order and
 * missing braces in the React workspaces and nothing else, so an autofix never rewrites code under
 * a rule whose fix needs judgment. The ignores and import groups come from eslint.config.mjs, which
 * is for checking only. Every plugin a suppression can name is registered, and unused-directive
 * reporting is off, so a fix never removes or trips over a suppression the full configuration needs.
 */
export default [
  { ignores },
  {
    files: ['packages/patina/**/*.{ts,tsx}', 'apps/storybook/**/*.{ts,tsx}'],
    linterOptions: { reportUnusedDisableDirectives: 'off' },
    languageOptions: { parser: tseslint.parser },
    plugins: {
      ...reactPlugins,
      '@typescript-eslint': tseslint.plugin,
    },
    rules: {
      curly: ['error', 'all'],
      'simple-import-sort/imports': ['error', { groups: importSortGroups }],
      'simple-import-sort/exports': 'error',
    },
  },
];
