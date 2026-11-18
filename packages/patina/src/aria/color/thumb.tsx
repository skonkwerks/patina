import { ColorThumb as AriaColorThumb } from 'react-aria-components';
import { tv } from 'tailwind-variants';

import { focusRing } from '../../internal/focus.js';

/**
 * The thumb of a color slider, area or wheel: a circle filled with the chosen color, in a white
 * ring between two black hairlines. It stands over any color, so its ring is not a token: over a
 * light color the black lines stand out, over a dark one the white ring does, and one of the two
 * always reaches at least 4.5:1 against whatever lies behind (white and black are 21:1 apart). The
 * inner hairline sets the ring apart from the thumb's own fill in the same way.
 *
 * With keyboard focus it carries the shared focus ring and grows, as it does while dragged, so it
 * stays easy to find on a color close to the focus ring's own. React Aria places it (`left`, `top`
 * and a centering transform); the classes center it on the other axis of a slider.
 */
const colorThumbStyles = tv({
  extend: focusRing,
  base: 'top-1/2 left-1/2 box-border size-5 rounded-full border-2 border-white shadow-[0_0_0_1px_black,inset_0_0_0_1px_black] forced-color-adjust-none',
  variants: {
    isFocusVisible: { true: 'size-7' },
    isDragging: { true: 'size-7' },
  },
});

/**
 * The thumb every color control draws, internal to the color family. React Aria fills it with the
 * chosen color and holds the hidden inputs that carry its name and value.
 */
export const ColorThumb = () => (
  <AriaColorThumb className={(state) => colorThumbStyles(state)} />
);
