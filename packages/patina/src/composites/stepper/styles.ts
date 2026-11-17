import { tv } from 'tailwind-variants';

import { DISABLED } from '../../internal/disabled.ts';
import { focusRing } from '../../internal/focus.ts';

/** The row of steps under a dialog's title. */
export const stepperStyles = tv({
  base: 'border-overlay-border flex flex-wrap gap-4 border-b pb-3',
});

/**
 * One step: a quiet button with its number in a circle, read from React Aria's render state. The
 * current step is in the primary color; another step brightens under the pointer unless it is
 * disabled, so a step that cannot be moved to never looks as if it could. The steps stand on the
 * overlay layer, where a dialog draws them.
 */
export const stepStyles = tv({
  extend: focusRing,
  slots: {
    base: 'text-overlay-foreground-muted inline-flex cursor-pointer items-center gap-2 rounded-sm text-sm transition-colors select-none',
    number:
      'border-overlay-border flex size-6 shrink-0 items-center justify-center rounded-full border text-xs',
  },
  variants: {
    isCurrent: {
      true: { base: 'text-primary font-medium', number: 'border-primary' },
    },
    isHovered: { true: '' },
    isDisabled: { true: { base: DISABLED } },
  },
  compoundVariants: [
    {
      isHovered: true,
      isDisabled: false,
      isCurrent: false,
      class: { base: 'text-overlay-foreground' },
    },
  ],
  defaultVariants: { isCurrent: false, isDisabled: false },
});
