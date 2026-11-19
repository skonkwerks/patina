import { tv } from 'tailwind-variants';

/**
 * The shell: the sidebar, the scrolling main area, and the side panel side by side, filling the
 * height it is given (the app gives `html`, `body` and its root element the full height).
 */
export const appShellStyles = tv({
  slots: {
    root: 'flex h-full',
    main: 'min-h-0 min-w-0 flex-1 overflow-auto',
  },
});
