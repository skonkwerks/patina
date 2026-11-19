import type { ComponentProps } from 'react';

/**
 * The root element of `Calendar` and `RangeCalendar`, through React Aria's `render` prop: React
 * Aria's own `div` (its `role='application'`, names and ref), marked `aria-disabled` while the
 * calendar is disabled. React Aria marks the days and the grid of a disabled calendar disabled, but
 * not the root that holds the month's name; marking the root says it of the whole widget, and lets
 * the month's name and the weekday row take the shared disabled look like the days. React Aria
 * hides both from assistive technology, so without the mark the contrast check could not tell they
 * belong to a disabled control. Not exported from the package.
 */
export const renderCalendarRoot = (
  props: ComponentProps<'div'>,
  { isDisabled }: { isDisabled: boolean },
) => <div {...props} aria-disabled={isDisabled || undefined} />;
