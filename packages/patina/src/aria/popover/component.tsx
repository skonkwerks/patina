import {
  Popover as AriaPopover,
  type PopoverProps as AriaPopoverProps,
} from 'react-aria-components';
import { tv } from 'tailwind-variants';

import { DISABLED } from '../../internal/disabled.ts';
import { OverlayContextBoundary } from '../../internal/overlaycontextboundary.tsx';

export const popoverStyles = tv({
  base: 'bg-overlay border-overlay-border text-overlay-foreground rounded-md border shadow-lg outline-0',
});

/**
 * An option in a list on an overlay, defined once for `ListBoxItem` (the options of a `Select`, a
 * `ComboBox` and a `MultiSelect`) and `MenuItem`: one row of text in the overlay's color (its `base`
 * slot), filled with the overlay's hover color while it holds the focus, and the shared disabled
 * look. The single-choice check is defined here too: a 14px check in a 16px frame (`checkFrame`,
 * `check`), the size of the checkbox mark's check and box at a list row's size, so the labels of a
 * single choice, a multiple choice and a menu stand at the same place; it is invisible on an item
 * that is not chosen, which keeps its room. Each extends it with what is its own, such as a chosen
 * option's weight or a menu item's destructive color.
 */
export const overlayOptionStyles = tv({
  slots: {
    base: 'text-overlay-foreground flex cursor-default items-center gap-2 rounded px-2 py-1.5 text-sm outline-0 select-none',
    checkFrame: 'flex size-4 shrink-0 items-center justify-center',
    check: 'size-3.5',
  },
  variants: {
    isFocused: { true: 'bg-overlay-hover' },
    isDisabled: { true: DISABLED },
    isSelected: { false: { check: 'invisible' } },
  },
});

export type PopoverProps = Omit<AriaPopoverProps, 'className'> & {
  /** Size and layout only. */
  className?: string;
};

/**
 * Shared overlay surface; React Aria owns positioning, dismissal, and focus behavior. What it was
 * opened from does not reach into it (`OverlayContextBoundary`): a `Separator` or a `ToggleGroup` in
 * a popover opened from a `Toolbar` takes its own orientation.
 */
export const Popover = ({ className, children, ...props }: PopoverProps) => (
  <AriaPopover {...props} className={popoverStyles({ className })}>
    {(renderProps) => (
      <OverlayContextBoundary>
        {typeof children === 'function' ? children(renderProps) : children}
      </OverlayContextBoundary>
    )}
  </AriaPopover>
);
