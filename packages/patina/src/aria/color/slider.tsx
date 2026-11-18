import {
  ColorSlider as AriaColorSlider,
  type ColorSliderProps as AriaColorSliderProps,
  SliderOutput,
  SliderTrack,
} from 'react-aria-components';
import { tv } from 'tailwind-variants';

import { useDescriptionId } from '../../internal/descriptionid.js';
import { DISABLED } from '../../internal/disabled.js';
import { fieldStyles } from '../../internal/field.js';
import {
  FieldHeader,
  type FieldHeaderProps,
} from '../../internal/fieldheader.js';
import { gradientOverGrid } from './fill.js';
import { ColorThumb } from './thumb.js';

export const colorSliderStyles = tv({
  slots: {
    // The shared field column (`fieldStyles`' `root`) stacks the header and the track.
    root: 'min-w-0',
    output: 'text-surface-foreground-muted text-sm tabular-nums',
    // An inner edge in `control-border`, so the track's extent shows where its gradient is as light
    // or as dark as the layer, or clear (an alpha track's end).
    track: 'inset-ring-control-border relative shrink-0 rounded-md inset-ring',
  },
  variants: {
    orientation: {
      // 2px above and below the 24px track: room for the thumb, which grows from 20px to 28px
      // while focused or dragged, so that with its focus ring it stays inside the column's gap,
      // clear of the description or the label above.
      horizontal: { track: 'my-0.5 h-6 w-full' },
      vertical: { root: 'items-center', track: 'h-48 w-6' },
    },
    // A disabled color slider is drawn disabled by its track, which holds the thumb, so the thumb
    // fades with it once. Its label keeps its contrast, as `Slider`'s does: it names the thumb's
    // hidden input through `aria-labelledby` rather than `for`, so the contrast check cannot tell it
    // is the label of a disabled control. Its value keeps its contrast, as a field's description does.
    isDisabled: { true: { track: DISABLED } },
  },
});

export type ColorSliderProps = Omit<AriaColorSliderProps, 'className'> &
  FieldHeaderProps & {
    /**
     * The visible label. Without one, React Aria's localized name of the channel is shown ("Hue",
     * "Alpha"), with no `optionalText`. A slider named by `aria-label` or `aria-labelledby` shows
     * no label.
     */
    label?: string;
    /**
     * Shows the channel's value at the end of the label row (React Aria's `SliderOutput`),
     * formatted for the channel and the user's locale ("210°", "50%").
     */
    hasValueOutput?: boolean;
    /** Size and placement only. */
    className?: string;
  };

/**
 * Adjusts one channel of a color (`channel`, in `colorSpace`) on a track that shows the channel's
 * range, under the shared field header. React Aria gives the thumb's input its channel's name and a
 * value said in words: the channel's value and a description of the color ("210°, cyan blue"). The
 * arrow keys step the channel; Page Up and Page Down, or Shift with an arrow key, take larger
 * steps; Home and End go to the ends. React Aria's color slider has no description slot, so the
 * slider lists its `description` in the thumb's `aria-describedby` itself.
 * Horizontal by default; `orientation='vertical'` stands it upright beside a color area.
 */
export const ColorSlider = ({
  label,
  optionalText,
  info,
  description,
  hasValueOutput = false,
  className,
  ...props
}: ColorSliderProps) => {
  const hasVisibleLabel =
    props['aria-label'] === undefined && props['aria-labelledby'] === undefined;
  const { descriptionId, 'aria-describedby': describedBy } = useDescriptionId(
    description,
    props['aria-describedby'],
  );
  return (
    <AriaColorSlider
      {...props}
      aria-describedby={describedBy}
      className={({ orientation }) =>
        fieldStyles().root({
          className: colorSliderStyles({ orientation }).root({ className }),
        })
      }
    >
      {({ orientation, isDisabled }) => {
        const styles = colorSliderStyles({ orientation, isDisabled });
        return (
          <>
            {/* The label is not faded; see `isDisabled` above. Without `label`, React Aria fills it
              with the channel's name. */}
            <FieldHeader
              label={label}
              hasLabel={hasVisibleLabel}
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
