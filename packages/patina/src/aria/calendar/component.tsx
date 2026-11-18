import { use } from 'react';
import {
  Calendar as AriaCalendar,
  CalendarCell,
  type CalendarProps as AriaCalendarProps,
  type DateValue,
  Text,
} from 'react-aria-components';
// React Aria exports the selection mode's type from the calendar's own entry point alone.
import type { CalendarSelectionMode } from 'react-aria-components/Calendar';

import { CalendarLayerContext } from './context.ts';
import { CalendarMonth } from './month.tsx';
import { renderCalendarRoot } from './root.tsx';
import { calendarCellStyles, calendarStyles } from './styles.ts';

export type CalendarProps<
  T extends DateValue,
  M extends CalendarSelectionMode = 'single',
> = Omit<AriaCalendarProps<T, M>, 'className' | 'children' | 'render'> & {
  /** The error to show under the calendar; also marks the chosen day invalid. */
  errorMessage?: string;
  className?: string;
};

/**
 * A month of days to choose one from (or several, with `selectionMode='multiple'`). The arrow keys
 * move a day or a week, Page Up and Page Down a month (with Shift, a year), Home and End to the
 * month's first and last day, and Enter or Space chooses the focused day.
 * `visibleDuration={{ months: 2 }}` shows months side by side. React Aria names the calendar from
 * the months it shows; an `aria-label` says what the date is for. The value is an
 * `@internationalized/date` object the calendar only passes through.
 */
export const Calendar = <
  T extends DateValue,
  M extends CalendarSelectionMode = 'single',
>({
  errorMessage,
  className,
  ...rest
}: CalendarProps<T, M>) => {
  const layer = use(CalendarLayerContext);
  const monthCount = rest.visibleDuration?.months ?? 1;
  return (
    <AriaCalendar
      {...rest}
      // Set only for a caller's error, so a date picker's own invalid state still reaches it.
      isInvalid={errorMessage === undefined ? rest.isInvalid : true}
      className={calendarStyles({ layer }).root({ className })}
      render={renderCalendarRoot}
    >
      {({ isDisabled }) => {
        const styles = calendarStyles({ layer, isDisabled });
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
                        calendarCellStyles({ ...renderProps, layer })
                      }
                    />
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
    </AriaCalendar>
  );
};
