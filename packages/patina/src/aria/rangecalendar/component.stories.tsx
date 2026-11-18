import {
  type CalendarDate,
  isWeekend,
  parseDate,
} from '@internationalized/date';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import {
  I18nProvider,
  type RangeValue,
  useLocale,
} from 'react-aria-components';
import { expect } from 'storybook/test';

import {
  dayName,
  monthNames,
  pageButton,
  ringOf,
} from '../calendar/month.testing.js';
import { RangeCalendar, type RangeCalendarProps } from './index.js';

const november = {
  start: parseDate('2026-11-10'),
  end: parseDate('2026-11-13'),
};

const meta = {
  title: 'Aria/RangeCalendar',
  component: RangeCalendar<CalendarDate>,
  args: { 'aria-label': 'Trip dates', defaultValue: november },
} satisfies Meta<RangeCalendarProps<CalendarDate>>;

export default meta;
type Story = StoryObj<RangeCalendarProps<CalendarDate>>;

/** A range calendar and a line that shows the range it gives, so a test reads what was chosen. */
const RangeCalendarWithValue = (props: RangeCalendarProps<CalendarDate>) => {
  const [value, setValue] = useState<RangeValue<CalendarDate> | null>(
    props.defaultValue ?? null,
  );
  return (
    <div className='flex flex-col gap-2'>
      <RangeCalendar
        {...props}
        defaultValue={undefined}
        value={value}
        onChange={setValue}
      />
      <p role='status' className='text-canvas-foreground-muted text-xs'>
        {value === null
          ? 'No range'
          : `${value.start.toString()} to ${value.end.toString()}`}
      </p>
    </div>
  );
};

/**
 * The range is a band with its ends filled. The first press starts a new range and Enter on
 * another day ends it; the arrows and Page Down move the focus between them.
 */
export const Default: Story = {
  render: (args) => <RangeCalendarWithValue {...args} />,
  play: async ({ canvas, canvasElement, userEvent }) => {
    await userEvent.click(
      canvas.getByRole('button', { name: dayName('November 16, 2026') }),
    );
    await userEvent.keyboard('{ArrowRight}{ArrowRight}{ArrowDown}');
    await expect(
      canvas.getByRole('button', { name: dayName('November 25, 2026') }),
    ).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(canvas.getByRole('status')).toHaveTextContent(
      '2026-11-16 to 2026-11-25',
    );

    // A range may run into the next month: Page Down moves there.
    await userEvent.click(
      canvas.getByRole('button', { name: dayName('November 20, 2026') }),
    );
    await userEvent.keyboard('{PageDown}');
    await expect(monthNames(canvasElement)).toEqual(['December 2026']);
    await expect(
      canvas.getByRole('button', { name: dayName('December 20, 2026') }),
    ).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(canvas.getByRole('status')).toHaveTextContent(
      '2026-11-20 to 2026-12-20',
    );
  },
};

/** Nothing chosen yet; the calendar opens on the month of `defaultFocusedValue`. */
export const Empty: Story = {
  args: {
    defaultValue: undefined,
    defaultFocusedValue: parseDate('2026-11-01'),
  },
};

/** Bounded: days outside the bounds take the disabled look, and Previous and Next stop there. */
export const WithBounds: Story = {
  args: {
    minValue: parseDate('2026-11-05'),
    maxValue: parseDate('2026-11-25'),
  },
  play: async ({ canvas, canvasElement }) => {
    await expect(pageButton(canvasElement, 'Previous')).toBeDisabled();
    await expect(
      canvas.getByRole('button', { name: dayName('November 26, 2026') }),
    ).toHaveAttribute('aria-disabled', 'true');
  },
};

/** Weekends cannot be chosen, by the locale's own weekend. */
const WeekdaysOnly = (props: RangeCalendarProps<CalendarDate>) => {
  const { locale } = useLocale();
  return (
    <RangeCalendarWithValue
      {...props}
      isDateUnavailable={(date) => isWeekend(date, locale)}
    />
  );
};

/**
 * A range cannot run over an unavailable day: once a range starts on Thursday, the days past the
 * weekend cannot end it.
 */
export const UnavailableDates: Story = {
  render: (args) => <WeekdaysOnly {...args} />,
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(
      canvas.getByRole('button', { name: dayName('November 19, 2026') }),
    );
    await expect(
      canvas.getByRole('button', { name: dayName('November 23, 2026') }),
    ).toHaveAttribute('aria-disabled', 'true');
    await userEvent.click(
      canvas.getByRole('button', { name: dayName('November 20, 2026') }),
    );
    await expect(canvas.getByRole('status')).toHaveTextContent(
      '2026-11-19 to 2026-11-20',
    );
  },
};

/** With `allowsNonContiguousRanges`, a range may run over the weekend it cannot hold. */
export const NonContiguous: Story = {
  args: { allowsNonContiguousRanges: true },
  render: (args) => <WeekdaysOnly {...args} />,
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(
      canvas.getByRole('button', { name: dayName('November 19, 2026') }),
    );
    await userEvent.click(
      canvas.getByRole('button', { name: dayName('November 24, 2026') }),
    );
    await expect(canvas.getByRole('status')).toHaveTextContent(
      '2026-11-19 to 2026-11-24',
    );
  },
};

/**
 * The app's own error: the band and its ends turn to the error color, and the message stands
 * below.
 */
export const WithError: Story = {
  args: { errorMessage: 'Choose at most three nights.' },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByText('Choose at most three nights.'),
    ).toBeVisible();
    const start = canvas.getByRole('button', {
      name: dayName('November 10, 2026'),
    });
    await expect(start).toHaveAttribute('data-invalid');
    // Under forced colors the band and the ends are `Mark`, with `MarkText` on them.
    const middle = canvas.getByRole('button', {
      name: dayName('November 11, 2026'),
    }).firstElementChild;
    await expect(start.firstElementChild).toHaveClass(
      'forced-colors:bg-[Mark]',
      'forced-colors:text-[MarkText]',
    );
    await expect(middle).toHaveClass('forced-colors:text-[MarkText]');
  },
};

/** No day takes a press; the calendar is marked disabled as a whole, as `Calendar` is. */
export const Disabled: Story = {
  args: { isDisabled: true },
  render: (args) => <RangeCalendarWithValue {...args} />,
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(
      canvas.getByRole('button', { name: dayName('November 20, 2026') }),
    );
    await expect(canvas.getByRole('status')).toHaveTextContent(
      '2026-11-10 to 2026-11-13',
    );
    await expect(canvas.getByRole('application')).toHaveAttribute(
      'aria-disabled',
      'true',
    );
  },
};

/**
 * The keyboard's focus on the range's start, a filled end: Tab passes Previous and Next and lands
 * on it. The ring, on the day inside the cell, stands off the fill by the shared offset.
 */
export const FocusedRangeEnd: Story = {
  play: async ({ canvas, userEvent }) => {
    const start = canvas.getByRole('button', {
      name: dayName('November 10, 2026'),
    });
    await userEvent.tab();
    await userEvent.tab();
    await userEvent.tab();
    await expect(start).toHaveFocus();
    const day = start.firstElementChild;
    if (day === null) {
      throw new Error('The range calendar draws no day inside its cell.');
    }
    const ring = ringOf(day);
    await expect(ring.width).toBe(2);
    await expect(ring.offset).toBeGreaterThanOrEqual(2);
  },
};

/** The days take the focus, but Enter starts no range. */
export const ReadOnly: Story = {
  args: { isReadOnly: true },
  render: (args) => <RangeCalendarWithValue {...args} />,
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(
      canvas.getByRole('button', { name: dayName('November 18, 2026') }),
    );
    await userEvent.keyboard('{ArrowRight}{Enter}{ArrowRight}{Enter}');
    await expect(canvas.getByRole('status')).toHaveTextContent(
      '2026-11-10 to 2026-11-13',
    );
  },
};

/** Two months side by side, for a range that runs over the turn of a month. */
export const TwoMonths: Story = {
  args: {
    visibleDuration: { months: 2 },
    defaultValue: {
      start: parseDate('2026-11-26'),
      end: parseDate('2026-12-04'),
    },
  },
  play: async ({ canvasElement }) => {
    await expect(monthNames(canvasElement)).toEqual([
      'November 2026',
      'December 2026',
    ]);
  },
};

/** In German, through React Aria's `I18nProvider`: the week starts on Monday. */
export const German: Story = {
  args: { 'aria-label': 'Reisedaten' },
  render: (args) => (
    <I18nProvider locale='de-DE'>
      <RangeCalendar {...args} />
    </I18nProvider>
  ),
  play: async ({ canvas, canvasElement }) => {
    // React Aria hides the weekday row from assistive technology; each day's name carries its
    // weekday.
    await expect(canvasElement.querySelector('th')).toHaveTextContent('M');
    await expect(
      canvas.getByRole('button', { name: dayName('10. November 2026') }),
    ).toBeVisible();
  },
};
