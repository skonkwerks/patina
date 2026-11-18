import {
  Separator as AriaSeparator,
  type SeparatorProps as AriaSeparatorProps,
} from 'react-aria-components';
import { tv, type VariantProps } from 'tailwind-variants';

/**
 * A line in the border color of the layer it stands on (`layer`: each layer's `-border` is the faint
 * line that divides its rows and panels). Horizontal by default, the full width of its container. A
 * vertical one is drawn by the `aria-orientation` React Aria gives it, so an orientation that comes
 * from a parent (a `Toolbar` turns its separators across its own direction) styles it as well as
 * one the caller sets; it stretches to the height of the row it stands in. `MenuSeparator` is this
 * line on the overlay, with a menu's spacing.
 */
export const separatorStyles = tv({
  base: 'h-px w-full shrink-0 border-0 aria-[orientation=vertical]:h-auto aria-[orientation=vertical]:w-px aria-[orientation=vertical]:self-stretch forced-colors:bg-[ButtonBorder]',
  variants: {
    layer: {
      canvas: 'bg-canvas-border',
      surface: 'bg-surface-border',
      overlay: 'bg-overlay-border',
    },
  },
  defaultVariants: { layer: 'surface' },
});

export type SeparatorProps = Omit<AriaSeparatorProps, 'className'> & {
  /**
   * The layer the line stands on, whose border color it takes: `surface` (the default; a card, a
   * panel, a toolbar on one), `canvas` (the page's background) or `overlay` (a popover or a dialog).
   */
  layer?: VariantProps<typeof separatorStyles>['layer'];
  /** Layout only, such as the margin around the line. */
  className?: string;
};

/**
 * A line between two groups of content, such as two groups of a toolbar's controls or two parts of
 * a panel. It is announced as a separator and is never focusable. `orientation='vertical'` stands
 * it between items of a row; inside a `Toolbar` it takes the orientation across the toolbar's own
 * by itself. It takes the layer it stands on from its caller (`layer`), as a component that can stand
 * on any layer does.
 */
export const Separator = ({ layer, className, ...rest }: SeparatorProps) => (
  <AriaSeparator {...rest} className={separatorStyles({ layer, className })} />
);
