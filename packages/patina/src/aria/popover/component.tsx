import {
  Popover as AriaPopover,
  type PopoverProps as AriaPopoverProps,
} from 'react-aria-components';
import { tv } from 'tailwind-variants';

import { DISABLED } from '../../internal/disabled.ts';

export const popoverStyles = tv({
  base: 'bg-overlay border-overlay-border text-overlay-foreground rounded-md border shadow-lg outline-0',
});

/**
 * An option in a list on an overlay, defined once for `SelectItem`, the `MultiSelect` options and
 * `MenuItem`: one row of text in the overlay's color, filled with the overlay's hover color while it
 * holds the focus, and the shared disabled look. Each list extends it with what is its own, such as
 * a chosen option's weight or a menu item's check.
 */
export const overlayOptionStyles = tv({
  base: 'text-overlay-foreground flex cursor-default items-center gap-2 rounded px-2 py-1.5 text-sm outline-0 select-none',
  variants: {
    isFocused: { true: 'bg-overlay-hover' },
    isDisabled: { true: DISABLED },
  },
});

export type PopoverProps = Omit<AriaPopoverProps, 'className'> & {
  /** Size and layout only. */
  className?: string;
};

/** Shared overlay surface; React Aria owns positioning, dismissal, and focus behavior. */
export const Popover = ({ className, ...props }: PopoverProps) => (
  <AriaPopover {...props} className={popoverStyles({ className })} />
);
