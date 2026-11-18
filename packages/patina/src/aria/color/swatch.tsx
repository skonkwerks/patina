import {
  ColorSwatch as AriaColorSwatch,
  type ColorSwatchProps as AriaColorSwatchProps,
} from 'react-aria-components';
import { tv, type VariantProps } from 'tailwind-variants';

import { colorOverGrid } from './fill.js';

/**
 * A swatch: a square of the control scale (`sm` 28px, `md` 32px, `lg` 36px), with an inner edge in
 * `control-border`, which reaches 3:1 against every layer, so a swatch of any color, the layer's own
 * included, shows its extent.
 */
export const colorSwatchStyles = tv({
  base: 'inset-ring-control-border box-border shrink-0 rounded-md inset-ring forced-color-adjust-none',
  variants: {
    size: { sm: 'size-7', md: 'size-8', lg: 'size-9' },
  },
  defaultVariants: { size: 'md' },
});

export type ColorSwatchProps = Omit<
  AriaColorSwatchProps,
  'className' | 'style'
> &
  VariantProps<typeof colorSwatchStyles> & {
    /** Size and placement only, such as a swatch smaller than the control scale inside a control. */
    className?: string;
  };

/**
 * A preview of a color, over a checkerboard where it is translucent. React Aria names it for
 * assistive technology with a description of the color in words ("dark vibrant blue"), so the color
 * is never told by its look alone; `colorName` replaces that description with the color's own name
 * (a palette's "Ocean"), and `aria-label` adds what the color is for ("Ocean, Background").
 *
 * Inside a `ColorPicker` or a `ColorSwatchPickerItem` it shows their color without a `color` prop.
 */
export const ColorSwatch = ({
  size,
  className,
  ...props
}: ColorSwatchProps) => (
  <AriaColorSwatch
    {...props}
    className={colorSwatchStyles({ size, className })}
    style={({ color }) => ({ background: colorOverGrid(color.toString()) })}
  />
);
