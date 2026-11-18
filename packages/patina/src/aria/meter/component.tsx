import {
  Label,
  Meter as AriaMeter,
  type MeterProps as AriaMeterProps,
} from 'react-aria-components';
import { tv } from 'tailwind-variants';

import { fieldStyles } from '../../internal/field.ts';
import type { StatusTone } from '../../internal/statustone.ts';
import { progressBarStyles } from '../progressbar/index.ts';

/**
 * The meter's look: a header row with the label and the value, over the progress bar's track and
 * fill, so every bar in the package is drawn alike. The fill takes the tone's color.
 */
export const meterStyles = tv({
  extend: progressBarStyles,
  slots: {
    root: 'flex min-w-0 flex-col gap-1.5',
    header: 'flex items-baseline justify-between gap-2',
    value: 'text-surface-foreground-muted ms-auto text-sm tabular-nums',
    fill: 'transition-[width] motion-reduce:transition-none',
  },
  variants: {
    // A tone colors the fill only; the value beside the label keeps the surface's muted text color.
    tone: {
      neutral: { fill: 'bg-surface-foreground-muted' },
      info: { fill: 'bg-info' },
      success: { fill: 'bg-success' },
      warning: { fill: 'bg-warning' },
      error: { fill: 'bg-error' },
    },
  },
});

export type MeterProps = Omit<
  AriaMeterProps,
  'children' | 'className' | 'aria-label'
> & {
  /**
   * The fill's color. The caller decides what a value means (a quota that is nearly used up is an
   * application rule), so the tone is never derived from the value here. Color is never the only
   * signal: a tone that means something (`warning`, `error`) is also said in words, in `valueLabel`
   * ("84%, nearly full") or in text beside the meter.
   */
  tone: StatusTone;
  /** The value, from `minValue` (0) to `maxValue` (100). */
  value: number;
  /** Layout only, such as a width. */
  className?: string;
} & (
    | {
        /** The visible label above the bar, such as "Storage"; it is also the meter's name. */
        label: string;
        /** Added to the visible `label` in the meter's accessible name, when the label alone is too short. */
        'aria-label'?: string;
      }
    | {
        label?: undefined;
        /** Required without a visible `label`: the meter's whole accessible name. */
        'aria-label': string;
      }
  );

/**
 * A quantity within a known range, such as the storage a quota allows: React Aria's `Meter`, drawn
 * as a labelled bar with its value at the end of the label row. The value shown is React Aria's
 * value text: a percentage by default, `formatOptions` for a unit, or `valueLabel` in words ("15.3
 * of 95.6 GiB"), which assistive technology hears too. The compact ring for a dashboard is `Gauge`;
 * progress toward completion is a `ProgressBar`.
 */
export const Meter = ({ tone, label, className, ...rest }: MeterProps) => {
  const styles = meterStyles({ tone });
  return (
    <AriaMeter {...rest} className={styles.root({ className })}>
      {({ percentage, valueText }) => (
        <>
          <div className={styles.header()}>
            {label && <Label className={fieldStyles().label()}>{label}</Label>}
            {/* The meter's value text is already its `aria-valuetext`, so the visible copy is hidden. */}
            <span aria-hidden className={styles.value()}>
              {valueText}
            </span>
          </div>
          <div className={styles.track()}>
            <div
              className={styles.fill()}
              style={{ width: `${String(percentage)}%` }}
            />
          </div>
        </>
      )}
    </AriaMeter>
  );
};
