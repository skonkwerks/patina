import { tv } from 'tailwind-variants';

/** The one focus ring: visible for keyboard focus only, drawn with the focus-ring token. */
export const focusRing = tv({
  base: 'outline-focus-ring outline-offset-2 forced-colors:outline-[Highlight]',
  variants: {
    isFocusVisible: {
      false: 'outline-0',
      true: 'outline-2',
    },
  },
});

/**
 * The same ring on an element that has no React Aria render state to say when the keyboard
 * focuses it (a plain element that takes the focus, or React Aria's `Dialog`): the browser's own
 * `:focus-visible` shows it, for keyboard focus only.
 */
export const focusVisibleRing = tv({
  extend: focusRing,
  base: 'outline-0 focus-visible:outline-2',
});
