import {
  ColorSlider as AriaColorSlider,
  type ColorSliderProps as AriaColorSliderProps,
  Label,
  SliderOutput,
  SliderTrack,
} from 'react-aria-components';
import { tv } from 'tailwind-variants';

import { DISABLED } from '../../internal/disabled.ts';
import { fieldStyles } from '../../internal/field.ts';
import { gradientOverGrid } from './fill.ts';
import { ColorThumb } from './thumb.tsx';

export const colorSliderStyles = tv({
  slots: {
    root: 'flex min-w-0 flex-col gap-2',
    header: 'flex items-baseline justify-between gap-2',
    output: 'text-surface-foreground-muted ms-auto text-sm tabular-nums',
    // An inner edge in `control-border`, so the track's extent shows where its gradient is as light
    // or as dark as the layer, or clear (an alpha track's end).
    track: 'inset-ring-control-border relative shrink-0 rounded-md inset-ring',
  },
  variants: {
    orientation: {
      horizontal: { track: 'h-6 w-full' },
      vertical: { root: 'items-center', track: 'h-48 w-6' },
    },
    // A disabled color slider is drawn disabled by its track, which holds the thumb, so the thumb
    // fades with it once. Its label keeps its contrast, as `Slider`'s does: it names the thumb's
    // hidden input through `aria-labelledby` rather than `for`, so the contrast check cannot tell it
    // is the label of a disabled control. Its value keeps its contrast, as a field's description does.
    isDisabled: { true: { track: DISABLED } },
  },
});

export type ColorSliderProps = Omit<AriaColorSliderProps, 'className'> & {
  /**
   * The visible label. Without one, React Aria's localized name of the channel is shown ("Hue",
   * "Alpha"). A slider named by `aria-label` or `aria-labelledby` shows no label.
   */
  label?: string;
  /**
   * Shows the channel's value at the end of the label row (React Aria's `SliderOutput`), formatted
   * for the channel and the user's locale ("210°", "50%").
   */
  hasValueOutput?: boolean;
  /** Size and placement only. */
  className?: string;
};

/**
 * Adjusts one channel of a color (`channel`, in `colorSpace`) on a track that shows the channel's
 * range. React Aria gives the thumb's input its channel's name and a value said in words: the
 * channel's value and a description of the color ("210°, cyan blue"). The arrow keys step the
 * channel; Page Up and Page Down, or Shift with an arrow key, take larger steps; Home and End go to
 * the ends.
 * Horizontal by default; `orientation='vertical'` stands it upright beside a color area.
 */
export const ColorSlider = ({
  label,
  hasValueOutput = false,
  className,
  ...props
}: ColorSliderProps) => {
  const hasVisibleLabel =
    props['aria-label'] === undefined && props['aria-labelledby'] === undefined;
  return (
    <AriaColorSlider
      {...props}
      className={({ orientation }) =>
        colorSliderStyles({ orientation }).root({ className })
      }
    >
      {({ orientation, isDisabled }) => {
        const styles = colorSliderStyles({ orientation, isDisabled });
        // The label is not faded; see `isDisabled` above.
        const parts = fieldStyles();
        return (
          <>
            {(hasVisibleLabel || hasValueOutput) && (
              <div className={styles.header()}>
                {/* Without children, React Aria fills the label with the channel's name. */}
                {hasVisibleLabel && (
                  <Label className={parts.label()}>{label}</Label>
                )}
                {hasValueOutput && <SliderOutput className={styles.output()} />}
              </div>
            )}
            <SliderTrack
              className={styles.track()}
              style={({ defaultStyle }) => ({
                ...defaultStyle,
                background: gradientOverGrid(defaultStyle.background),
              })}
            >
              <ColorThumb />
            </SliderTrack>
          </>
        );
      }}
    </AriaColorSlider>
  );
};
