import { defineConfig } from 'vitest/config';

// Unit specs of the package's pure decision functions run in Node beside the modules they test.
// Components are tested through their stories, in the Storybook workspace.
export default defineConfig({
  test: {
    include: ['src/**/*.spec.ts'],
    environment: 'node',
  },
});
