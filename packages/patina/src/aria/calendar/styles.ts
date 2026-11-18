import { tv } from 'tailwind-variants';

import { DISABLED } from '../../internal/disabled.js';
import { fieldStyles } from '../../internal/field.js';
import { focusRing } from '../../internal/focus.js';

/**
 * The parts of `Calendar` and `RangeCalendar`: the months side by side, each a header (Previous,
 * the month's name, Next) over a grid of 32px days, and the error under them. The header is three
 * columns, so a month's name stays centered whether or not its month carries a button. The colors
 * follow the layer the calendar stands on: a page's surface, or the date pickers' overlay.
 *
 * A disabled calendar takes the shared disabled look part by part: the days, the buttons, the
 * month's name and the weekday row.
 */
export const calendarStyles = tv({
  slots: {
    root: 'flex w-fit max-w-full flex-col gap-2',
    // Months wrap onto the next line where the width runs out; nothing clips, so the focus ring
    // of a day at the edge stays whole.
    months: 'flex flex-wrap gap-6',
    month: 'flex w-56 shrink-0 flex-col gap-2',
    header: 'grid grid-cols-[1.75rem_minmax(0,1fr)_1.75rem] items-center',
    previous: 'col-start-1',
    heading: 'col-start-2 truncate text-center text-sm font-semibold',
    next: 'col-start-3',
    navIcon: 'h-4 w-4',
    // Days touch sideways, so a range's band runs unbroken along a week; weeks keep a hairline apart.
    grid: 'border-separate border-spacing-x-0 border-spacing-y-0.5',
    headerCell: 'h-7 text-xs font-medium',
    // The field error's look, defined once in `fieldStyles`.
    error: fieldStyles.slots.error,
  },
  variants: {
    layer: {
      surface: {
        heading: 'text-surface-foreground',
        headerCell: 'text-surface-foreground-muted',
      },
      overlay: {
        heading: 'text-overlay-foreground',
        headerCell: 'text-overlay-foreground-muted',
      },
    },
    isDisabled: { true: { heading: DISABLED, headerCell: DISABLED } },
  },
});

/**
 * A day of `Calendar`, from React Aria's cell render state. The chosen day is filled with the
 * primary color (the error color while the calendar is invalid), today is underlined, and an
 * unavailable day is struck through in the muted color, so neither is told by color alone; an
 * unavailable today keeps both lines. A day outside `minValue` and `maxValue` takes the shared
 * disabled look. Days of the neighbouring months are hidden, as React Aria's own styles hide them.
 * The focus ring keeps the shared offset, so it stands clear of a chosen day's fill.
 *
 * The day keeps its own colors in forced colors (`forced-color-adjust-none`), so each is a system
 * color there: `CanvasText`, `GrayText` for an unavailable or disabled day, the highlight colors
 * for the chosen one, and `Mark` with `MarkText` for a chosen one while the calendar is invalid.
 */
export const calendarCellStyles = tv({
  extend: focusRing,
  base: 'flex size-8 cursor-default items-center justify-center rounded-md text-sm tabular-nums forced-color-adjust-none forced-colors:text-[CanvasText]',
  variants: {
    layer: {
      surface: 'text-surface-foreground',
      overlay: 'text-overlay-foreground',
    },
    isToday: { true: 'font-semibold underline-offset-4', false: '' },
    isUnavailable: { true: 'forced-colors:text-[GrayText]', false: '' },
    isOutsideMonth: { true: 'hidden' },
    isSelected: {
      true: 'bg-primary text-primary-foreground forced-colors:bg-[Highlight] forced-colors:text-[HighlightText]',
      false: '',
    },
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
      layer: 'surface',
      class: 'hover:bg-surface-hover',
    },
    {
      isSelected: false,
      layer: 'overlay',
      class: 'hover:bg-overlay-hover',
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
    {
      isSelected: true,
      isInvalid: true,
      class:
        'bg-error text-error-foreground forced-colors:bg-[Mark] forced-colors:text-[MarkText]',
    },
  ],
});
