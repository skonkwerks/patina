import { use } from 'react';
import {
  CalendarCell,
  type DateValue,
  RangeCalendar as AriaRangeCalendar,
  type RangeCalendarProps as AriaRangeCalendarProps,
  Text,
} from 'react-aria-components';
import { tv } from 'tailwind-variants';

import { DISABLED } from '../../internal/disabled.js';
import { focusRing } from '../../internal/focus.js';
import { CalendarLayerContext } from '../calendar/context.js';
import { CalendarMonth } from '../calendar/month.js';
import { renderCalendarRoot } from '../calendar/root.js';
import { calendarStyles } from '../calendar/styles.js';

/** The parts of `RangeCalendar` around its days: `Calendar`'s, which an app may extend for ranges alone. */
export const rangeCalendarStyles = tv({ extend: calendarStyles });

/**
 * A day's cell in `RangeCalendar`: the band of a range. The days of a range are tinted with the
 * primary color (the error color while the range is invalid), and the band is rounded at the
 * range's ends and at the ends of each week, so it runs unbroken along a week. Days of the
 * neighbouring months are hidden, as in `Calendar`.
 */
export const rangeCalendarCellStyles = tv({
  base: 'size-8 cursor-default text-sm outline-0 forced-color-adjust-none',
  variants: {
    isSelected: {
      true: 'bg-primary/15 forced-colors:bg-[Highlight] [td:first-child_&]:rounded-s-md [td:last-child_&]:rounded-e-md',
      false: '',
    },
    isSelectionStart: { true: 'rounded-s-md' },
    isSelectionEnd: { true: 'rounded-e-md' },
    isInvalid: { true: '' },
    isOutsideMonth: { true: 'hidden' },
  },
  compoundVariants: [
    {
      isSelected: true,
      isInvalid: true,
      class:
        'bg-error/15 forced-colors:bg-[Mark] forced-colors:text-[MarkText]',
    },
  ],
});

/** The ends of a range: filled, as `Calendar` fills its chosen day. */
const RANGE_END =
  'bg-primary text-primary-foreground forced-colors:bg-[Highlight] forced-colors:text-[HighlightText]';
const INVALID_RANGE_END =
  'bg-error text-error-foreground forced-colors:bg-[Mark] forced-colors:text-[MarkText]';

/**
 * A day inside its cell in `RangeCalendar`, from the cell's render state: the ends of the range are
 * filled, today is underlined, an unavailable day is struck through in the muted color (an
 * unavailable today keeps both lines), and a day outside `minValue` and `maxValue` takes the shared
 * disabled look. It carries the focus ring, since the cell's band runs edge to edge; the ring keeps
 * the shared offset, so it stands clear of a filled end.
 *
 * The cell keeps its own colors in forced colors (`forced-color-adjust-none`), so the day's text is
 * a system color there: `CanvasText`, `GrayText` for an unavailable or disabled day,
 * `HighlightText` on the range's `Highlight`, and `MarkText` on an invalid range's `Mark`.
 */
export const rangeCalendarDayStyles = tv({
  extend: focusRing,
  base: 'flex size-full items-center justify-center rounded-md tabular-nums forced-colors:text-[CanvasText]',
  variants: {
    layer: {
      surface: 'text-surface-foreground',
      overlay: 'text-overlay-foreground',
    },
    isToday: { true: 'font-semibold underline-offset-4', false: '' },
    isUnavailable: { true: 'forced-colors:text-[GrayText]', false: '' },
    isHovered: { true: '' },
    isSelected: { true: 'forced-colors:text-[HighlightText]', false: '' },
    isSelectionStart: { true: '' },
    isSelectionEnd: { true: '' },
    isInvalid: { true: '' },
    isDisabled: { true: [DISABLED, 'forced-colors:text-[GrayText]'] },
  },
  compoundVariants: [
    // Today's underline and an unavailable day's strike-through share one property, so each day
    // carries one class for it: an unavailable today sets both lines at once.
    { isToday: true, isUnavailable: false, class: 'underline' },
    { isToday: false, isUnavailable: true, class: 'line-through' },
    {
      isToday: true,
      isUnavailable: true,
      class: '[text-decoration-line:underline_line-through]',
    },
    {
      isSelected: false,
      isHovered: true,
      layer: 'surface',
      class: 'bg-surface-hover',
    },
    {
      isSelected: false,
      isHovered: true,
      layer: 'overlay',
      class: 'bg-overlay-hover',
    },
    {
      isSelected: false,
      isUnavailable: true,
      layer: 'surface',
      class: 'text-surface-foreground-muted',
    },
    {
      isSelected: false,
      isUnavailable: true,
      layer: 'overlay',
      class: 'text-overlay-foreground-muted',
    },
    { isSelectionStart: true, class: RANGE_END },
    { isSelectionEnd: true, class: RANGE_END },
    // An invalid range's band is `Mark` under forced colors, so its days take `MarkText`.
    {
      isSelected: true,
      isInvalid: true,
      class: 'forced-colors:text-[MarkText]',
    },
    { isSelectionStart: true, isInvalid: true, class: INVALID_RANGE_END },
    { isSelectionEnd: true, isInvalid: true, class: INVALID_RANGE_END },
  ],
});

export type RangeCalendarProps<T extends DateValue> = Omit<
  AriaRangeCalendarProps<T>,
  'className' | 'children' | 'render'
> & {
  /** The error to show under the calendar; also marks the chosen range invalid. */
  errorMessage?: string;
  className?: string;
};

/**
 * A month of days to choose a range from: the first press (or Enter) starts the range, the second
 * ends it, and the keyboard moves between them as in `Calendar`. A range cannot hold an
 * unavailable day unless `allowsNonContiguousRanges` is set. React Aria names the calendar from the
 * months it shows; an `aria-label` says what the range is for. The value is a `{ start, end }` of
 * `@internationalized/date` objects the calendar only passes through.
 */
export const RangeCalendar = <T extends DateValue>({
  errorMessage,
  className,
  ...rest
}: RangeCalendarProps<T>) => {
  const layer = use(CalendarLayerContext);
  const monthCount = rest.visibleDuration?.months ?? 1;
  return (
    <AriaRangeCalendar
      {...rest}
      // Set only for a caller's error, so a date range picker's own invalid state still reaches it.
      isInvalid={errorMessage === undefined ? rest.isInvalid : true}
      className={rangeCalendarStyles({ layer }).root({ className })}
      render={renderCalendarRoot}
    >
      {({ isDisabled }) => {
        const styles = rangeCalendarStyles({ layer, isDisabled });
        return (
          <>
            <div className={styles.months()}>
              {Array.from({ length: monthCount }, (_, offset) => (
                <CalendarMonth
                  key={offset}
                  offset={offset}
                  monthCount={monthCount}
                  styles={styles}
                >
                  {(date) => (
                    <CalendarCell
                      date={date}
                      className={(renderProps) =>
                        rangeCalendarCellStyles(renderProps)
                      }
                    >
                      {(renderProps) => (
                        <span
                          className={rangeCalendarDayStyles({
                            ...renderProps,
                            layer,
                          })}
                        >
                          {renderProps.formattedDate}
                        </span>
                      )}
                    </CalendarCell>
                  )}
                </CalendarMonth>
              ))}
            </div>
            {errorMessage !== undefined && (
              <Text slot='errorMessage' className={styles.error()}>
                {errorMessage}
              </Text>
            )}
          </>
        );
      }}
    </AriaRangeCalendar>
  );
};
