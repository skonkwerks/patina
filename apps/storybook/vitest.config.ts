import path from 'node:path';

import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

// Every story is a test: Storybook's Vitest addon renders each one in headless Chromium and runs its
// play function and the a11y addon's axe check, which fails the test on a violation
// (`a11y: { test: 'error' }` in .storybook/preview.tsx).
export default defineConfig({
  plugins: [
    storybookTest({ configDir: path.join(import.meta.dirname, '.storybook') }),
  ],
  test: {
    name: 'storybook',
    browser: {
      enabled: true,
      headless: true,
      provider: playwright(),
      instances: [{ browser: 'chromium' }],
    },
  },
});
