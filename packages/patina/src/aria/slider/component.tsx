import {
  Label,
  Slider as AriaSlider,
  SliderOutput,
  type SliderProps as AriaSliderProps,
  SliderThumb,
  SliderTrack,
} from 'react-aria-components';
import { tv } from 'tailwind-variants';

import { DISABLED } from '../../internal/disabled.ts';
import { fieldStyles } from '../../internal/field.ts';
import { focusRing } from '../../internal/focus.ts';

export const sliderStyles = tv({
  slots: {
    root: 'flex min-w-0 flex-col gap-2',
    header: 'flex items-baseline justify-between gap-2',
    output: 'text-surface-foreground-muted ms-auto text-sm tabular-nums',
    track: 'relative h-8 w-full',
    rail: 'bg-control-border absolute top-1/2 h-1 w-full -translate-y-1/2 rounded-full',
  },
  variants: {
    // A disabled slider is drawn disabled by its rail and its thumb. Its label, unlike other fields',
    // keeps its contrast: it names the thumb's hidden input through `aria-labelledby` rather than
    // `for`, so the contrast check cannot tell it is the label of a disabled control and a faded
    // label fails it. Its value keeps its contrast, as a field's description does.
    isDisabled: { true: { rail: DISABLED } },
  },
});

/** The slider's thumb, which carries the shared focus ring. */
export const sliderThumbStyles = tv({
  extend: focusRing,
  base: 'bg-primary border-overlay-border top-1/2 h-4 w-4 rounded-full border shadow-sm',
  variants: { isDisabled: { true: DISABLED } },
});

export type SliderProps = Omit<
  AriaSliderProps<number>,
  'children' | 'className' | 'orientation'
> & {
  label?: string;
  /**
   * Shows the current value at the end of the label row (React Aria's `SliderOutput`), formatted for
   * the user's locale with `formatOptions` (for example a percent or a unit).
   */
  hasValueOutput?: boolean;
  className?: string;
};

/** A single-value horizontal slider with the shared keyboard focus ring. */
export const Slider = ({
  label,
  hasValueOutput = false,
  className,
  ...props
}: SliderProps) => (
  <AriaSlider
    {...props}
    orientation='horizontal'
    className={sliderStyles().root({ className })}
  >
    {({ isDisabled }) => {
      const styles = sliderStyles({ isDisabled });
      // The label is not faded; see `isDisabled` above.
      const parts = fieldStyles();
      return (
        <>
          {(label || hasValueOutput) && (
            <div className={styles.header()}>
              {label && <Label className={parts.label()}>{label}</Label>}
              {hasValueOutput && <SliderOutput className={styles.output()} />}
            </div>
          )}
          <SliderTrack className={styles.track()}>
            <div className={styles.rail()} />
            <SliderThumb className={(state) => sliderThumbStyles(state)} />
          </SliderTrack>
        </>
      );
    }}
  </AriaSlider>
);
