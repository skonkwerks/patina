import {
  type CalendarDate,
  isWeekend,
  parseDate,
} from '@internationalized/date';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { I18nProvider, useLocale } from 'react-aria-components';
import { expect } from 'storybook/test';

import { Calendar, type CalendarProps } from './index.ts';
import { dayName, monthNames, pageButton, ringOf } from './month.testing.ts';

const meta = {
  title: 'Aria/Calendar',
  component: Calendar<CalendarDate>,
  args: {
    'aria-label': 'Appointment date',
    defaultValue: parseDate('2026-11-18'),
  },
} satisfies Meta<CalendarProps<CalendarDate>>;

export default meta;
type Story = StoryObj<CalendarProps<CalendarDate>>;

/** A calendar and a line that shows the value it gives, so a test reads what was chosen. */
const CalendarWithValue = (props: CalendarProps<CalendarDate>) => {
  const [value, setValue] = useState<CalendarDate | null>(
    props.defaultValue ?? null,
  );
  return (
    <div className='flex flex-col gap-2'>
      <Calendar
        {...props}
        defaultValue={undefined}
        value={value}
        onChange={setValue}
      />
      <p role='status' className='text-canvas-foreground-muted text-xs'>
        {value === null ? 'No date' : value.toString()}
      </p>
    </div>
  );
};

/**
 * The chosen day is filled. The arrows move a day or a week, Page Down and Page Up a month, and
 * Enter chooses the focused day.
 */
export const Default: Story = {
  render: (args) => <CalendarWithValue {...args} />,
  play: async ({ canvas, canvasElement, userEvent }) => {
    await userEvent.click(
      canvas.getByRole('button', { name: dayName('November 18, 2026') }),
    );
    await userEvent.keyboard('{ArrowRight}');
    await expect(
      canvas.getByRole('button', { name: dayName('November 19, 2026') }),
    ).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    await expect(
      canvas.getByRole('button', { name: dayName('November 26, 2026') }),
    ).toHaveFocus();

    await userEvent.keyboard('{PageDown}');
    await expect(monthNames(canvasElement)).toEqual(['December 2026']);
    await expect(
      canvas.getByRole('button', { name: dayName('December 26, 2026') }),
    ).toHaveFocus();
    await userEvent.keyboard('{PageUp}');
    await expect(monthNames(canvasElement)).toEqual(['November 2026']);

    await userEvent.keyboard('{Enter}');
    await expect(canvas.getByRole('status')).toHaveTextContent('2026-11-26');
  },
};

/** Previous and Next, named by React Aria, page a month at a time. */
export const PreviousAndNext: Story = {
  play: async ({ canvasElement, userEvent }) => {
    await userEvent.click(pageButton(canvasElement, 'Next'));
    await expect(monthNames(canvasElement)).toEqual(['December 2026']);
    await userEvent.click(pageButton(canvasElement, 'Previous'));
    await userEvent.click(pageButton(canvasElement, 'Previous'));
    await expect(monthNames(canvasElement)).toEqual(['October 2026']);
  },
};

/** Nothing chosen yet; the calendar opens on the month of `defaultFocusedValue`. */
export const Empty: Story = {
  args: {
    defaultValue: undefined,
    defaultFocusedValue: parseDate('2026-11-01'),
  },
};

/**
 * Bounded to a stretch of November: days outside it take the disabled look and the keyboard stops
 * at its ends, and Previous and Next are disabled at the bounds.
 */
export const WithBounds: Story = {
  args: {
    minValue: parseDate('2026-11-10'),
    maxValue: parseDate('2026-11-25'),
  },
  play: async ({ canvas, canvasElement, userEvent }) => {
    await expect(pageButton(canvasElement, 'Previous')).toBeDisabled();
    await expect(pageButton(canvasElement, 'Next')).toBeDisabled();
    await expect(
      canvas.getByRole('button', { name: dayName('November 9, 2026') }),
    ).toHaveAttribute('aria-disabled', 'true');

    const first = canvas.getByRole('button', {
      name: dayName('November 10, 2026'),
    });
    await userEvent.click(first);
    await userEvent.keyboard('{ArrowLeft}');
    await expect(first).toHaveFocus();
  },
};

/** Weekends cannot be chosen, by the locale's own weekend; they are struck through. */
const WeekdaysOnly = (props: CalendarProps<CalendarDate>) => {
  const { locale } = useLocale();
  return (
    <CalendarWithValue
      {...props}
      isDateUnavailable={(date) => isWeekend(date, locale)}
    />
  );
};

/** An unavailable day takes the focus, so it can be read, but Enter does not choose it. */
export const UnavailableDates: Story = {
  args: { defaultValue: parseDate('2026-11-20') },
  render: (args) => <WeekdaysOnly {...args} />,
  play: async ({ canvas, userEvent }) => {
    const saturday = canvas.getByRole('button', {
      name: dayName('November 21, 2026'),
    });
    await expect(saturday).toHaveAttribute('aria-disabled', 'true');
    await expect(saturday).toHaveAttribute('data-unavailable');
    await userEvent.click(
      canvas.getByRole('button', { name: dayName('November 20, 2026') }),
    );
    await userEvent.keyboard('{ArrowRight}');
    await expect(saturday).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(canvas.getByRole('status')).toHaveTextContent('2026-11-20');

    // Under forced colors each day's text is a system color. The story runs without forced colors,
    // so the classes are what can be checked here.
    await expect(saturday).toHaveClass('forced-colors:text-[GrayText]');
    await expect(
      canvas.getByRole('button', { name: dayName('November 19, 2026') }),
    ).toHaveClass('forced-colors:text-[CanvasText]');
    await expect(
      canvas.getByRole('button', { name: dayName('November 20, 2026') }),
    ).toHaveClass('forced-colors:text-[HighlightText]');
  },
};

/** The app's own error: the chosen day turns to the error color and the message stands below. */
export const WithError: Story = {
  args: {
    defaultValue: parseDate('2026-11-21'),
    errorMessage: 'Choose a weekday.',
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Choose a weekday.')).toBeVisible();
    const chosen = canvas.getByRole('button', {
      name: dayName('November 21, 2026'),
    });
    await expect(chosen).toHaveAttribute('data-invalid');
    // Under forced colors the invalid fill is `Mark`, with `MarkText` on it.
    await expect(chosen).toHaveClass(
      'forced-colors:bg-[Mark]',
      'forced-colors:text-[MarkText]',
    );
  },
};

/**
 * No day takes the keyboard or a press. The calendar is marked disabled as a whole, so its month's
 * name and weekday row take the disabled look with the days.
 */
export const Disabled: Story = {
  args: { isDisabled: true },
  render: (args) => <CalendarWithValue {...args} />,
  play: async ({ canvas, canvasElement, userEvent }) => {
    await userEvent.click(
      canvas.getByRole('button', { name: dayName('November 20, 2026') }),
    );
    await expect(canvas.getByRole('status')).toHaveTextContent('2026-11-18');
    await expect(pageButton(canvasElement, 'Next')).toBeDisabled();
    await expect(canvas.getByRole('application')).toHaveAttribute(
      'aria-disabled',
      'true',
    );
    const heading = canvasElement.querySelector('div:has(> [role="grid"]) h2');
    const weekday = canvasElement.querySelector('th');
    if (heading === null || weekday === null) {
      throw new Error('The calendar shows no month name or weekday row.');
    }
    await expect(getComputedStyle(heading).opacity).toBe('0.5');
    await expect(getComputedStyle(weekday).opacity).toBe('0.5');
  },
};

/**
 * The keyboard's focus on the chosen day: Tab passes Previous and Next and lands on it. The ring
 * stands off the day's fill by the shared offset, with the layer showing between, so it does not
 * merge with a fill of nearly its color.
 */
export const FocusedChosenDay: Story = {
  play: async ({ canvas, userEvent }) => {
    const chosen = canvas.getByRole('button', {
      name: dayName('November 18, 2026'),
    });
    await userEvent.tab();
    await userEvent.tab();
    await userEvent.tab();
    await expect(chosen).toHaveFocus();
    const ring = ringOf(chosen);
    await expect(ring.width).toBe(2);
    await expect(ring.offset).toBeGreaterThanOrEqual(2);
  },
};

/** Every day unavailable, on the month that holds today: today keeps its underline under the strike. */
export const UnavailableToday: Story = {
  args: { defaultValue: undefined, isDateUnavailable: () => true },
  play: async ({ canvasElement }) => {
    const today = canvasElement.querySelector('[data-today]');
    if (today === null) {
      throw new Error('The calendar does not show today.');
    }
    const lines = getComputedStyle(today).textDecorationLine;
    await expect(lines).toContain('underline');
    await expect(lines).toContain('line-through');
  },
};

/** The days take the focus, but Enter chooses nothing. */
export const ReadOnly: Story = {
  args: { isReadOnly: true },
  render: (args) => <CalendarWithValue {...args} />,
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(
      canvas.getByRole('button', { name: dayName('November 18, 2026') }),
    );
    await userEvent.keyboard('{ArrowRight}{Enter}');
    await expect(canvas.getByRole('status')).toHaveTextContent('2026-11-18');
  },
};

/**
 * Two months side by side. Page Down moves the focus a month, here within what is shown; Next pages
 * both months on (`pageBehavior` makes it page one month instead).
 */
export const TwoMonths: Story = {
  args: { visibleDuration: { months: 2 } },
  play: async ({ canvas, canvasElement, userEvent }) => {
    await expect(monthNames(canvasElement)).toEqual([
      'November 2026',
      'December 2026',
    ]);
    await userEvent.click(
      canvas.getByRole('button', { name: dayName('November 18, 2026') }),
    );
    await userEvent.keyboard('{PageDown}');
    await expect(
      canvas.getByRole('button', { name: dayName('December 18, 2026') }),
    ).toHaveFocus();
    await userEvent.click(pageButton(canvasElement, 'Next'));
    await expect(monthNames(canvasElement)).toEqual([
      'January 2027',
      'February 2027',
    ]);
  },
};

/** The delivery days chosen at first. */
const firstDeliveries: readonly CalendarDate[] = [
  parseDate('2026-11-03'),
  parseDate('2026-11-10'),
  parseDate('2026-11-17'),
];

/** A calendar of several days and a line that shows the days it gives. */
const DeliveryDays = () => {
  const [days, setDays] = useState(firstDeliveries);
  return (
    <div className='flex flex-col gap-2'>
      <Calendar
        aria-label='Delivery days'
        selectionMode='multiple'
        value={days}
        onChange={setDays}
      />
      <p role='status' className='text-canvas-foreground-muted text-xs'>
        {days
          .map((day) => day.toString())
          // A new array from `map`, so sorting it in place changes no state; ISO dates sort as text.
          .sort((first, second) => first.localeCompare(second))
          .join(', ')}
      </p>
    </div>
  );
};

/** Several days, with `selectionMode='multiple'`: a press on a chosen day removes it, on another adds it. */
export const MultipleDays: Story = {
  render: () => <DeliveryDays />,
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(
      canvas.getByRole('button', { name: dayName('November 10, 2026') }),
    );
    await expect(canvas.getByRole('status')).toHaveTextContent(
      '2026-11-03, 2026-11-17',
    );
    await userEvent.click(
      canvas.getByRole('button', { name: dayName('November 12, 2026') }),
    );
    await expect(canvas.getByRole('status')).toHaveTextContent(
      '2026-11-03, 2026-11-12, 2026-11-17',
    );
  },
};

/**
 * In German, through React Aria's `I18nProvider`: the week starts on Monday, and the days and the
 * month are named in German.
 */
export const German: Story = {
  args: { 'aria-label': 'Termin', defaultValue: parseDate('2026-03-18') },
  render: (args) => (
    <I18nProvider locale='de-DE'>
      <Calendar {...args} />
    </I18nProvider>
  ),
  play: async ({ canvas, canvasElement }) => {
    // React Aria hides the weekday row from assistive technology; each day's name carries its
    // weekday.
    const weekdays = [...canvasElement.querySelectorAll('th')].map(
      (cell) => cell.textContent,
    );
    await expect(weekdays).toEqual(['M', 'D', 'M', 'D', 'F', 'S', 'S']);
    await expect(monthNames(canvasElement)).toEqual(['März 2026']);
    await expect(
      canvas.getByRole('button', { name: dayName('Mittwoch, 18. März 2026') }),
    ).toBeVisible();
  },
};
