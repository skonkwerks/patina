import '../src/styles.css';

import { withThemeByClassName } from '@storybook/addon-themes';
import type { Preview } from '@storybook/react-vite';

const preview: Preview = {
  parameters: {
    layout: 'padded',
    controls: { expanded: true },
    // Every story is checked against axe; a violation fails a test run, not only the panel.
    a11y: { test: 'error' },
    backgrounds: { disable: true },
  },
  decorators: [
    // The theme's light and dark modes, as the class on <html> an app would set.
    withThemeByClassName({
      themes: { light: '', dark: 'dark' },
      defaultTheme: 'light',
      parentSelector: 'html',
    }),
  ],
};

export default preview;
