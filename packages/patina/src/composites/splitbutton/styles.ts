import { tv } from 'tailwind-variants';

import { buttonStyles } from '../../aria/button/index.js';
import { iconButtonStyles } from '../../aria/iconbutton/index.js';

/** The two parts side by side; the part with keyboard focus rises above its neighbor. */
export const splitButtonStyles = tv({
  slots: {
    root: 'isolate inline-flex shrink-0 items-stretch',
    chevron: 'size-4',
  },
});

/**
 * Where a part meets the other: the action's end corners and the menu part's start corners are
 * square, a faint line divides them, and a focused part rises so its whole ring shows. These are
 * compound variants, not variants: tailwind-variants puts an extending style's variants before the
 * look's `size` and `radius`, so tailwind-merge would drop the square corners as overridden by the
 * later `rounded-md`, and its compound variants come after every variant.
 */
const join = {
  action: 'relative rounded-e-none focus-visible:z-10',
  menu: 'border-primary-foreground/25 relative rounded-s-none border-s focus-visible:z-10',
};

/** The action, and a menu part that shows a value in words: the button look, joined. */
export const splitButtonPartStyles = tv({
  extend: buttonStyles,
  variants: { join: { action: '', menu: '' } },
  compoundVariants: [
    { join: 'action', class: join.action },
    { join: 'menu', class: join.menu },
  ],
});

/** The menu part that shows only a chevron: the icon button look, joined. */
export const splitButtonMenuIconStyles = tv({
  extend: iconButtonStyles,
  variants: { join: { menu: '' } },
  compoundVariants: [{ join: 'menu', class: join.menu }],
});
