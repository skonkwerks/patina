import { use } from 'react';
import {
  ColorSwatchPickerItem as AriaColorSwatchPickerItem,
  type ColorSwatchPickerItemProps as AriaColorSwatchPickerItemProps,
} from 'react-aria-components';
import { tv } from 'tailwind-variants';

import { DISABLED } from '../../internal/disabled.js';
import { focusRing } from '../../internal/focus.js';
import { SwatchSizeContext } from './context.js';
import { ColorSwatch } from './swatch.js';

/**
 * A swatch to choose; its root carries the shared focus ring. The chosen one is marked by a frame
 * inside it, a black line and a white one, not by a change of its color: the frame stands over the
 * swatch's own color, so it is fixed rather than a token, and one of its two lines always stands
 * out from it.
 */
export const colorSwatchPickerItemStyles = tv({
  slots: {
    root: 'relative cursor-pointer rounded-md',
    selectedFrame:
      'pointer-events-none absolute inset-0 rounded-md border-2 border-black outline-2 -outline-offset-4 outline-white forced-color-adjust-none',
  },
  variants: {
    isDisabled: { true: { root: DISABLED } },
  },
});

export type ColorSwatchPickerItemProps = Omit<
  AriaColorSwatchPickerItemProps,
  'className' | 'style' | 'children'
> & {
  /**
   * The color's own name, such as a palette's "Ocean", read in place of React Aria's description of
   * the color in words ("dark vibrant blue").
   */
  colorName?: string;
};

/** One color in a `ColorSwatchPicker`, at the picker's size. */
export const ColorSwatchPickerItem = ({
  colorName,
  ...props
}: ColorSwatchPickerItemProps) => {
  const size = use(SwatchSizeContext);
  return (
    <AriaColorSwatchPickerItem
      {...props}
      className={(state) =>
        colorSwatchPickerItemStyles(state).root({
          className: focusRing(state),
        })
      }
    >
      {(state) => (
        <>
          <ColorSwatch size={size} colorName={colorName} />
          {state.isSelected && (
            <div
              className={colorSwatchPickerItemStyles(state).selectedFrame()}
            />
          )}
        </>
      )}
    </AriaColorSwatchPickerItem>
  );
};
