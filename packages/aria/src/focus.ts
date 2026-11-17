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
