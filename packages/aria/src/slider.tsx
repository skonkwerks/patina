import {
  Label,
  Slider as AriaSlider,
  SliderOutput,
  type SliderProps as AriaSliderProps,
  SliderThumb,
  SliderTrack,
} from 'react-aria-components';
import { tv } from 'tailwind-variants';

import { focusRing } from './focus.ts';

export const sliderStyles = tv({
  slots: {
    root: 'flex min-w-0 flex-col gap-2',
    header: 'flex items-baseline justify-between gap-2',
    label: 'text-surface-foreground text-sm font-medium',
    output: 'text-surface-foreground-muted ms-auto text-sm tabular-nums',
    track: 'relative h-8 w-full',
    rail: 'bg-input-border absolute top-1/2 h-1 w-full -translate-y-1/2 rounded-full',
  },
});

/** The slider's thumb, which carries the shared focus ring. */
export const sliderThumbStyles = tv({
  extend: focusRing,
  base: 'bg-primary border-overlay-border top-1/2 h-4 w-4 rounded-full border shadow-sm disabled:opacity-50',
});

export type SliderProps = Omit<
  AriaSliderProps<number>,
  'children' | 'className' | 'orientation'
> & {
  label?: string;
  /**
   * Show the current value at the end of the label row, formatted for the user's locale with
   * `formatOptions` (for example a percent or a unit).
   */
  showValue?: boolean;
  className?: string;
};

/** A single-value horizontal slider with the shared keyboard focus ring. */
export const Slider = ({
  label,
  showValue = false,
  className,
  ...props
}: SliderProps) => {
  const styles = sliderStyles();
  return (
    <AriaSlider
      {...props}
      orientation='horizontal'
      className={styles.root({ className })}
    >
      {(label || showValue) && (
        <div className={styles.header()}>
          {label && <Label className={styles.label()}>{label}</Label>}
          {showValue && <SliderOutput className={styles.output()} />}
        </div>
      )}
      <SliderTrack className={styles.track()}>
        <div className={styles.rail()} />
        <SliderThumb className={(state) => sliderThumbStyles(state)} />
      </SliderTrack>
    </AriaSlider>
  );
};
