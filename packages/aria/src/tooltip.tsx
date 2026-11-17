import {
  Tooltip as AriaTooltip,
  type TooltipProps as AriaTooltipProps,
} from 'react-aria-components';
import { tv } from 'tailwind-variants';

export { TooltipTrigger } from 'react-aria-components';

/** How far a tooltip stands from its trigger, in pixels. */
const TOOLTIP_OFFSET_PX = 8;

export const tooltipStyles = tv({
  base: 'bg-overlay border-overlay-border text-overlay-foreground z-50 max-w-72 rounded-md border px-3 py-2 text-sm shadow-lg',
});

export type TooltipProps = Omit<AriaTooltipProps, 'className'> & {
  /** Layout only. */
  className?: string;
};

/**
 * Shared accessible tooltip surface; content is available on hover and keyboard focus. Put it in a
 * `TooltipTrigger` around a plain focusable element; a `Button` or `IconButton` carries its own
 * tooltip (`tooltip`, `hasTooltip`, `disabledReason`), so no trigger is put around one.
 */
export const Tooltip = ({ className, ...props }: TooltipProps) => (
  <AriaTooltip
    {...props}
    offset={TOOLTIP_OFFSET_PX}
    className={tooltipStyles({ className })}
  />
);
