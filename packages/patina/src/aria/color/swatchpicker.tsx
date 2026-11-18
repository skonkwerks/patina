import {
  ColorSwatchPicker as AriaColorSwatchPicker,
  type ColorSwatchPickerProps as AriaColorSwatchPickerProps,
} from 'react-aria-components';
import { tv } from 'tailwind-variants';

import { SwatchSizeContext } from './context.js';
import type { ColorSwatchProps } from './swatch.js';

/** The swatches in a wrapping row (`grid`) or a column (`stack`), spaced so focus rings never touch. */
export const colorSwatchPickerStyles = tv({
  base: 'flex gap-2',
  variants: {
    layout: { grid: 'flex-wrap', stack: 'flex-col' },
  },
});

export type ColorSwatchPickerProps = Omit<
  AriaColorSwatchPickerProps,
  'className' | 'style'
> & {
  /** The size of every swatch in it, on the control scale (`sm` 28px, `md` 32px, `lg` 36px). */
  size?: ColorSwatchProps['size'];
  /** Placement only. */
  className?: string;
};

/**
 * Choose one color from a set of `ColorSwatchPickerItem`s: a list of one Tab stop, in which the
 * arrow keys move between swatches and Enter or Space chooses one. React Aria names the list
 * ("Color swatches") unless `aria-label` says what the color is for, and names each swatch for its
 * color in words.
 */
export const ColorSwatchPicker = ({
  size,
  className,
  ...props
}: ColorSwatchPickerProps) => (
  <SwatchSizeContext value={size}>
    <AriaColorSwatchPicker
      {...props}
      className={({ layout }) => colorSwatchPickerStyles({ layout, className })}
    />
  </SwatchSizeContext>
);
