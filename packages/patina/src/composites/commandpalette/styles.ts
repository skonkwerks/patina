import { tv } from 'tailwind-variants';

/**
 * The palette's parts: a dialog wider than the default, and under its search field a list of one
 * height whatever the filter leaves, scrolling inside, so the field never moves while the person
 * types. A filter that leaves nothing shows its line in the middle of that list.
 */
export const commandPaletteStyles = tv({
  slots: {
    modal: 'max-w-lg',
    menu: 'h-72 overflow-y-auto',
    empty:
      'text-overlay-foreground-muted flex h-full items-center justify-center p-4 text-center text-sm',
  },
});
