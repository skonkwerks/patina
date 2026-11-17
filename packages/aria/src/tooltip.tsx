import {
  composeRenderProps,
  Tooltip as AriaTooltip,
  type TooltipProps,
} from 'react-aria-components';
import { tv } from 'tailwind-variants';

export { TooltipTrigger } from 'react-aria-components';

export const tooltipStyles = tv({
  base: 'bg-overlay border-overlay-border text-overlay-foreground z-50 max-w-72 rounded-md border px-3 py-2 text-sm shadow-lg',
});

/** Shared accessible tooltip surface; content is available on hover and keyboard focus. */
export const Tooltip = ({ className, ...props }: TooltipProps) => (
  <AriaTooltip
    {...props}
    offset={8}
    className={composeRenderProps(className, (cls) =>
      tooltipStyles({ className: cls }),
    )}
  />
);
