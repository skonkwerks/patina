import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import {
  Button,
  CalendarGrid,
  CalendarGridBody,
  type CalendarGridBodyProps,
  CalendarGridHeader,
  CalendarHeaderCell,
  CalendarHeading,
  useLocale,
} from 'react-aria-components';

import { iconButtonStyles } from '../iconbutton/index.ts';
import type { calendarStyles } from './styles.ts';

export type CalendarMonthProps = {
  /** Which of the visible months this is, from 0. */
  offset: number;
  /** How many months the calendar shows: the first carries Previous, the last carries Next. */
  monthCount: number;
  /** The calendar's parts, for its layer and its disabled state: `calendarStyles` or one extending it. */
  styles: ReturnType<typeof calendarStyles>;
  /** Draws one day, a `CalendarCell`. */
  children: CalendarGridBodyProps['children'];
};

/**
 * One month of `Calendar` or `RangeCalendar`: its header and its grid of days, which the calendar
 * around it fills from its own state. React Aria names Previous and Next and its grid, and disables
 * Previous and Next at `minValue` and `maxValue`, moving the focus into the grid when the button
 * that held it is disabled. In a right-to-left locale the chevrons point the other way. Not a
 * public subpath.
 */
export const CalendarMonth = ({
  offset,
  monthCount,
  styles,
  children,
}: CalendarMonthProps) => {
  const { direction } = useLocale();
  const Back = direction === 'rtl' ? IconChevronRight : IconChevronLeft;
  const Forward = direction === 'rtl' ? IconChevronLeft : IconChevronRight;
  return (
    <div className={styles.month()}>
      <div className={styles.header()}>
        {offset === 0 && (
          <Button
            slot='previous'
            className={(renderProps) =>
              iconButtonStyles({
                ...renderProps,
                variant: 'ghost',
                size: 'sm',
                className: styles.previous(),
              })
            }
          >
            <Back aria-hidden className={styles.navIcon()} />
          </Button>
        )}
        <CalendarHeading
          offset={{ months: offset }}
          className={styles.heading()}
        />
        {offset === monthCount - 1 && (
          <Button
            slot='next'
            className={(renderProps) =>
              iconButtonStyles({
                ...renderProps,
                variant: 'ghost',
                size: 'sm',
                className: styles.next(),
              })
            }
          >
            <Forward aria-hidden className={styles.navIcon()} />
          </Button>
        )}
      </div>
      <CalendarGrid offset={{ months: offset }} className={styles.grid()}>
        <CalendarGridHeader>
          {(day) => (
            <CalendarHeaderCell className={styles.headerCell()}>
              {day}
            </CalendarHeaderCell>
          )}
        </CalendarGridHeader>
        <CalendarGridBody>{children}</CalendarGridBody>
      </CalendarGrid>
    </div>
  );
};
