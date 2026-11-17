import {
  composeRenderProps,
  Popover as AriaPopover,
  type PopoverProps,
} from 'react-aria-components';
import { tv } from 'tailwind-variants';

export const popoverStyles = tv({
  base: 'bg-overlay border-overlay-border text-overlay-foreground rounded-md border shadow-lg outline-0',
});

/** Shared overlay surface; React Aria owns positioning, dismissal, and focus behavior. */
export const Popover = ({ className, ...props }: PopoverProps) => (
  <AriaPopover
    {...props}
    className={composeRenderProps(className, (cls) =>
      popoverStyles({ className: cls }),
    )}
  />
);
