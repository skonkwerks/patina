import {
  ColorWheel as AriaColorWheel,
  type ColorWheelProps as AriaColorWheelProps,
  ColorWheelTrack,
} from 'react-aria-components';
import { tv } from 'tailwind-variants';

import { DISABLED } from '../../internal/disabled.ts';
import { gradientOverGrid } from './fill.ts';
import { ColorThumb } from './thumb.tsx';

/**
 * The wheel's radii, in pixels: 192px across, as wide as a color area, with a track 24px wide, as
 * tall as a color slider's, so the three line up in one picker.
 */
const OUTER_RADIUS = 96;
const INNER_RADIUS = 72;

/**
 * The wheel and the two edges of its track in `control-border`, so the ring's extent shows where its
 * hues are as light or as dark as the layer. React Aria clips the track to the ring, so an edge drawn
 * on the track would be clipped away: the wheel draws them, the outer one on its own bound and the
 * inner one on a circle of the inner radius. Forced colors would remove their box shadows, so they
 * keep their colors there, as the track does. A disabled wheel fades once, with all it holds.
 */
export const colorWheelStyles = tv({
  slots: {
    // As wide as its track (React Aria sizes the track, not the wheel), and the frame the edges and
    // the thumb are placed in, also inside a column that would stretch it.
    root: 'relative w-fit shrink-0',
    outerEdge:
      'inset-ring-control-border pointer-events-none absolute inset-0 rounded-full inset-ring forced-color-adjust-none',
    innerEdge:
      'ring-control-border pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full ring forced-color-adjust-none',
  },
  variants: {
    isDisabled: { true: { root: DISABLED } },
  },
});

export type ColorWheelProps = Omit<
  AriaColorWheelProps,
  'className' | 'children' | 'outerRadius' | 'innerRadius'
> & {
  /** Placement only; the wheel's size is its own. */
  className?: string;
};

/**
 * Adjusts the hue of a color on a circular track. React Aria names it "Hue" unless `aria-label`
 * says more, and says its value in words: the angle and the name of the hue ("210°, cyan blue").
 * The arrow keys step the hue; Shift with an arrow key, Page Up and Page Down take larger steps.
 */
export const ColorWheel = ({ className, ...props }: ColorWheelProps) => {
  const styles = colorWheelStyles();
  return (
    <AriaColorWheel
      {...props}
      outerRadius={OUTER_RADIUS}
      innerRadius={INNER_RADIUS}
      className={({ isDisabled }) =>
        colorWheelStyles({ isDisabled }).root({ className })
      }
    >
      <ColorWheelTrack
        style={({ defaultStyle }) => ({
          ...defaultStyle,
          background: gradientOverGrid(defaultStyle.background),
        })}
      />
      <div aria-hidden className={styles.outerEdge()} />
      <div
        aria-hidden
        className={styles.innerEdge()}
        style={{ width: INNER_RADIUS * 2, height: INNER_RADIUS * 2 }}
      />
      <ColorThumb />
    </AriaColorWheel>
  );
};
