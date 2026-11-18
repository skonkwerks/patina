import {
  ColorArea as AriaColorArea,
  type ColorAreaProps as AriaColorAreaProps,
} from 'react-aria-components';
import { tv } from 'tailwind-variants';

import { DISABLED } from '../../internal/disabled.js';
import { ColorThumb } from './thumb.js';

/**
 * A square 192px wide by default, as wide as a color wheel; a caller sets another width through
 * `className` and the height follows. An inner edge in `control-border` shows its extent where its
 * gradient is as light or as dark as the layer. A disabled area fades once, with the thumb it holds.
 */
export const colorAreaStyles = tv({
  base: 'inset-ring-control-border relative aspect-square w-48 shrink-0 rounded-md inset-ring',
  variants: {
    isDisabled: { true: DISABLED },
  },
});

export type ColorAreaProps = Omit<
  AriaColorAreaProps,
  'className' | 'children'
> & {
  /**
   * Size and placement only. React Aria sets the area's `position` inline, so a caller that places
   * it absolutely, as in the middle of a `ColorWheel`, places a wrapper around it.
   */
  className?: string;
};

/**
 * Adjusts two channels of a color at once (`xChannel` across, `yChannel` up, in `colorSpace`)
 * against a gradient of the two. React Aria names it "Color picker" unless `aria-label` says more,
 * and says its value in words: the channels with their values and a description of the color
 * ("Saturation: 60%, Brightness: 80%, Hue: 210°, cyan blue"), and after a step from the keyboard,
 * the channel stepped ("Brightness: 81%, cyan blue"). The arrow keys step a channel; Shift with an
 * arrow key, Page Up and Page Down (the vertical channel), and Home and End (the horizontal one)
 * take larger steps.
 */
export const ColorArea = ({ className, ...props }: ColorAreaProps) => (
  <AriaColorArea
    {...props}
    className={({ isDisabled }) => colorAreaStyles({ isDisabled, className })}
  >
    <ColorThumb />
  </AriaColorArea>
);
