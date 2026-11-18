import {
  Slider as AriaSlider,
  SliderOutput,
  type SliderProps as AriaSliderProps,
  SliderThumb,
  SliderTrack,
} from 'react-aria-components';
import { tv } from 'tailwind-variants';

import { useDescriptionId } from '../../internal/descriptionid.ts';
import { DISABLED } from '../../internal/disabled.ts';
import { fieldStyles } from '../../internal/field.ts';
import {
  FieldHeader,
  type FieldHeaderProps,
} from '../../internal/fieldheader.tsx';
import { focusRing } from '../../internal/focus.ts';

export const sliderStyles = tv({
  slots: {
    // The shared field column (`fieldStyles`' `root`) stacks the header and the track. The track
    // is 32px around the 16px thumb, so the thumb and its focus ring stay inside it.
    root: 'min-w-0',
    output: 'text-surface-foreground-muted text-sm tabular-nums',
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
> &
  FieldHeaderProps & {
    label?: string;
    /**
     * Shows the current value at the end of the label row (React Aria's `SliderOutput`), formatted
     * for the user's locale with `formatOptions` (for example a percent or a unit).
     */
    hasValueOutput?: boolean;
    className?: string;
  };

/**
 * A single-value horizontal slider with the shared keyboard focus ring, under the shared field
 * header. React Aria's slider has no description slot, so the slider lists its description in the
 * thumb's `aria-describedby` itself.
 */
export const Slider = ({
  label,
  optionalText,
  info,
  description,
  hasValueOutput = false,
  className,
  ...props
}: SliderProps) => {
  const { descriptionId, 'aria-describedby': describedBy } = useDescriptionId(
    description,
    props['aria-describedby'],
  );
  return (
    <AriaSlider
      {...props}
      aria-describedby={describedBy}
      orientation='horizontal'
      className={fieldStyles().root({
        className: sliderStyles().root({ className }),
      })}
    >
      {({ isDisabled }) => {
        const styles = sliderStyles({ isDisabled });
        return (
          <>
            {/* The label is not faded; see `isDisabled` above. */}
            <FieldHeader
              label={label}
              optionalText={optionalText}
              info={info}
              end={
                hasValueOutput ? (
                  <SliderOutput className={styles.output()} />
                ) : undefined
              }
              description={description}
              descriptionId={descriptionId}
            />
            <SliderTrack className={styles.track()}>
              <div className={styles.rail()} />
              <SliderThumb className={(state) => sliderThumbStyles(state)} />
            </SliderTrack>
          </>
        );
      }}
    </AriaSlider>
  );
};
