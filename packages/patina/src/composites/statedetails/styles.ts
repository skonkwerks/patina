import { tv } from 'tailwind-variants';

import { iconButtonStyles } from '../../aria/iconbutton/index.ts';

/**
 * The details control: a small ghost icon button whose icon is drawn in the state's tone, and keeps
 * that color under the pointer, since the color is what it says. It extends the icon button's look,
 * so its focus, pending and disabled states are the icon button's own.
 */
export const stateDetailsControlStyles = tv({
  extend: iconButtonStyles,
  variants: {
    statusTone: { error: '', warning: '', info: '' },
  },
  compoundVariants: [
    {
      statusTone: 'error',
      class: 'text-error hover:text-error',
    },
    { statusTone: 'warning', class: 'text-warning hover:text-warning' },
    { statusTone: 'info', class: 'text-info hover:text-info' },
  ],
});

/** The popover that holds the words, held to the window and scrolling within it. */
export const stateDetailsStyles = tv({
  slots: {
    icon: 'size-4',
    popover: 'max-w-sm overflow-auto p-3',
  },
});

/**
 * The words' dialog takes the focus when it opens (it holds no control), so it draws the shared
 * focus ring's color and width for a keyboard user instead of removing its outline. React Aria's
 * `Dialog` has no focus render state, so the browser's `:focus-visible` decides when it shows.
 */
export const stateDetailsDialogStyles = tv({
  base: 'outline-focus-ring rounded-sm text-sm leading-6 break-words outline-0 outline-offset-2 focus-visible:outline-2 forced-colors:outline-[Highlight]',
});
