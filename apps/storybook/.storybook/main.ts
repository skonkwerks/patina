import type { StorybookConfig } from '@storybook/react-vite';
import tailwindcss from '@tailwindcss/vite';

/**
 * Stories live next to their components in each package; this app only configures Storybook and
 * styles it like an app that uses the packages would.
 */
const config: StorybookConfig = {
  framework: '@storybook/react-vite',
  // No usage telemetry leaves this machine.
  core: { disableTelemetry: true },
  stories: ['../../../packages/*/src/**/*.stories.tsx'],
  addons: [
    '@storybook/addon-docs',
    '@storybook/addon-a11y',
    '@storybook/addon-themes',
    '@storybook/addon-vitest',
  ],
  viteFinal: (vite) => {
    vite.plugins = [...(vite.plugins ?? []), tailwindcss()];
    return vite;
  },
};

export default config;
