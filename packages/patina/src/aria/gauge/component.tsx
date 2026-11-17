import type { ReactNode } from 'react';
import {
  Label,
  Meter,
  type MeterProps,
  useLocale,
} from 'react-aria-components';
import { tv } from 'tailwind-variants';

import type { StatusTone } from '../../internal/statustone.ts';

/**
 * The ring's drawn box, written once for the ring and its middle. Tailwind reads the class from
 * this literal. `size-11` is 44px, the same as `RING_SIZE`, so one unit of the SVG's viewBox is one
 * CSS pixel; change the two together.
 */
const RING_BOX = 'size-11';

/** The ring's size and stroke, in the units of the SVG's viewBox (CSS pixels at `RING_BOX`). */
const RING_SIZE = 44;
const RING_STROKE = 4;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

export const gaugeStyles = tv({
  slots: {
    root: 'relative inline-flex flex-col items-center gap-0.5',
    ring: RING_BOX,
    track: 'stroke-surface-border',
    fill: 'transition-[stroke-dashoffset] motion-reduce:transition-none',
    center: `text-surface-foreground absolute top-0 flex ${RING_BOX} items-center justify-center text-xs font-medium [&>svg]:size-5`,
    label: 'text-surface-foreground-muted text-xs',
  },
  variants: {
    // A tone colors the ring only; the number in it keeps the surface's text color.
    tone: {
      neutral: { fill: 'stroke-surface-foreground-muted' },
      info: { fill: 'stroke-info' },
      success: { fill: 'stroke-success' },
      warning: { fill: 'stroke-warning' },
      destructive: { fill: 'stroke-destructive' },
    },
  },
});

// No `formatOptions`: the ring always shows a percentage, so the spoken value is the same one; a
// different spoken value is `valueLabel`.
export type GaugeProps = Omit<
  MeterProps,
  | 'children'
  | 'className'
  | 'value'
  | 'valueLabel'
  | 'aria-label'
  | 'formatOptions'
> & {
  /**
   * The ring's color. The caller decides what a value means (a load threshold is an application
   * rule), so the tone is never derived from the value here.
   */
  tone: StatusTone;
  /**
   * What the ring holds instead of the number, such as an icon. It is decorative: the meter's name
   * and value say what it shows.
   */
  icon?: ReactNode;
  /** Layout only. */
  className?: string;
} & (
    | {
        /** The short visible label under the ring, such as "GPU"; it is also the meter's name. */
        label: string;
        /** Added to the visible `label` in the meter's accessible name, when the label alone is too short. */
        'aria-label'?: string;
      }
    | {
        label?: undefined;
        /** Required without a visible `label`: the meter's whole accessible name. */
        'aria-label': string;
      }
  ) &
  (
    | {
        /** The value, from `minValue` (0) to `maxValue` (100). */
        value: number;
        /** The value in words for assistive technology, such as "15.3 of 95.6 GiB". */
        valueLabel?: string;
      }
    | {
        /** No value: the quantity was not observed. The ring is empty and shows a dash. */
        value?: undefined;
        /** Required without a value: what assistive technology hears instead, such as "Not reported". */
        valueLabel: string;
      }
  );

/**
 * A small radial gauge: React Aria's `Meter` (a quantity within a known range) drawn as a ring
 * filled to the value, with the percentage in the middle. Its name is the visible `label` or
 * `aria-label`; `valueLabel` gives the value in words. A gauge with no value draws an empty ring
 * and a dash, and says `valueLabel`. Not for progress toward completion, which is a `ProgressBar`.
 */
export const Gauge = ({
  tone,
  icon,
  label,
  className,
  value,
  valueLabel,
  ...rest
}: GaugeProps) => {
  const { locale } = useLocale();
  const styles = gaugeStyles({ tone });
  return (
    <Meter
      {...rest}
      value={value ?? 0}
      valueLabel={valueLabel}
      className={styles.root({ className })}
    >
      {({ percentage }) => {
        const offset = RING_CIRCUMFERENCE * (1 - percentage / 100);
        return (
          <>
            <svg
              viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
              className={styles.ring()}
              aria-hidden
            >
              <circle
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={RING_RADIUS}
                fill='none'
                strokeWidth={RING_STROKE}
                className={styles.track()}
              />
              {value !== undefined && (
                <circle
                  cx={RING_SIZE / 2}
                  cy={RING_SIZE / 2}
                  r={RING_RADIUS}
                  fill='none'
                  strokeWidth={RING_STROKE}
                  strokeLinecap='round'
                  strokeDasharray={RING_CIRCUMFERENCE}
                  strokeDashoffset={offset}
                  transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2})`}
                  className={styles.fill()}
                />
              )}
            </svg>
            {/* The meter's name and value say what the ring shows, so its middle is decoration. */}
            <span aria-hidden className={styles.center()}>
              {icon ??
                (value === undefined
                  ? '–'
                  : new Intl.NumberFormat(locale, {
                      style: 'percent',
                      maximumFractionDigits: 0,
                    }).format(percentage / 100))}
            </span>
            {label && <Label className={styles.label()}>{label}</Label>}
          </>
        );
      }}
    </Meter>
  );
};
