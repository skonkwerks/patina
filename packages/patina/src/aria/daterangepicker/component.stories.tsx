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
import { expect, waitFor, within } from 'storybook/test';

import { Button } from '../button/index.js';
import { dayName, ringOf } from '../calendar/month.testing.js';
import { ringClearance } from '../datepicker/picker.testing.js';
import { Form } from '../form/index.js';
import { DateRangePicker, type DateRangePickerProps } from './index.js';

const november = {
  start: parseDate('2026-11-10'),
  end: parseDate('2026-11-13'),
};

const meta = {
  title: 'Aria/DateRangePicker',
  component: DateRangePicker<CalendarDate>,
  args: { label: 'Trip dates' },
  decorators: [
    (Story) => (
      <div className='w-72'>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<DateRangePickerProps<CalendarDate>>;

export default meta;
type Story = StoryObj<DateRangePickerProps<CalendarDate>>;

/**
 * A date range picker and a line that shows the range it gives, so a test reads what was chosen.
 */
const DateRangePickerWithValue = (
  props: DateRangePickerProps<CalendarDate>,
) => {
  const [value, setValue] = useState<RangeValue<CalendarDate> | null>(
    props.defaultValue ?? null,
  );
  return (
    <div className='flex flex-col gap-2'>
      <DateRangePicker
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
 * Typed: the start date's segments, then the end date's, each filled with digits; the focus runs
 * from the start date into the end date.
 */
export const Default: Story = {
  render: (args) => <DateRangePickerWithValue {...args} />,
  play: async ({ canvas, userEvent }) => {
    const segments = canvas.getAllByRole('spinbutton');
    await expect(segments).toHaveLength(6);
    const [startMonth, , , endMonth] = segments;
    if (startMonth === undefined || endMonth === undefined) {
      throw new Error('The date range picker shows no start and end dates.');
    }
    await userEvent.click(startMonth);
    await userEvent.keyboard('11202026');
    await expect(endMonth).toHaveFocus();
    await userEvent.keyboard('11252026');
    await expect(canvas.getByRole('status')).toHaveTextContent(
      '2026-11-20 to 2026-11-25',
    );
  },
};

/**
 * The calendar button opens the range calendar on the range's start. Enter starts a new range, and
 * React Aria moves the focus on a day so the band shows; Enter on another day ends the range, which
 * closes the calendar and gives the focus back to the button.
 */
export const WithValue: Story = {
  args: { defaultValue: november },
  render: (args) => <DateRangePickerWithValue {...args} />,
  play: async ({ canvas, canvasElement, userEvent }) => {
    const page = within(canvasElement.ownerDocument.body);
    const button = canvas.getByRole('button', { name: /Calendar/ });
    await userEvent.click(button);
    const dialog = await page.findByRole('dialog');
    await waitFor(async () => {
      await expect(
        within(dialog).getByRole('button', {
          name: dayName('November 10, 2026'),
        }),
      ).toHaveFocus();
    });

    await userEvent.keyboard('{ArrowRight}{Enter}');
    await expect(
      within(dialog).getByRole('button', {
        name: dayName('November 12, 2026'),
      }),
    ).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}{Enter}');
    await waitFor(async () => {
      await expect(page.queryByRole('dialog')).not.toBeInTheDocument();
    });
    await expect(canvas.getByRole('status')).toHaveTextContent(
      '2026-11-11 to 2026-11-19',
    );
    await expect(button).toHaveFocus();
  },
};

/**
 * From the field, Alt+Down Arrow opens the calendar; Escape closes it and gives the focus back to
 * the segment it came from, with the range unchanged.
 */
export const KeyboardOpen: Story = {
  args: { defaultValue: november },
  render: (args) => <DateRangePickerWithValue {...args} />,
  play: async ({ canvas, canvasElement, userEvent }) => {
    const page = within(canvasElement.ownerDocument.body);
    const [startMonth] = canvas.getAllByRole('spinbutton');
    if (startMonth === undefined) {
      throw new Error('The date range picker shows no segments.');
    }
    await userEvent.click(startMonth);
    await userEvent.keyboard('{Alt>}{ArrowDown}{/Alt}');
    await page.findByRole('dialog');
    await userEvent.keyboard('{Escape}');
    await waitFor(async () => {
      await expect(page.queryByRole('dialog')).not.toBeInTheDocument();
    });
    await expect(startMonth).toHaveFocus();
    await expect(canvas.getByRole('status')).toHaveTextContent(
      '2026-11-10 to 2026-11-13',
    );
  },
};

/** Bounded: the calendar's days outside the bounds take the disabled look. */
export const WithBounds: Story = {
  args: {
    defaultValue: november,
    minValue: parseDate('2026-11-05'),
    maxValue: parseDate('2026-11-25'),
    description: 'Between 5 and 25 November.',
  },
  play: async ({ canvas, canvasElement, userEvent }) => {
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole('button', { name: /Calendar/ }));
    const dialog = await page.findByRole('dialog');
    await expect(
      within(dialog).getByRole('button', {
        name: dayName('November 26, 2026'),
      }),
    ).toHaveAttribute('aria-disabled', 'true');
  },
};

/** Weekends cannot be in a range, by the locale's own weekend. */
const WeekdaysOnly = (props: DateRangePickerProps<CalendarDate>) => {
  const { locale } = useLocale();
  return (
    <Form onSubmit={() => undefined}>
      <DateRangePicker
        {...props}
        isDateUnavailable={(date) => isWeekend(date, locale)}
      />
      <Button type='submit' className='self-start'>
        Save
      </Button>
    </Form>
  );
};

/**
 * A typed range that ends on a weekend shows React Aria's own message when the form is submitted.
 * React Aria checks the two ends against `isDateUnavailable`; the calendar also keeps a range from
 * running over an unavailable day unless `allowsNonContiguousRanges` is set.
 */
export const UnavailableDates: Story = {
  args: {
    defaultValue: {
      start: parseDate('2026-11-19'),
      end: parseDate('2026-11-21'),
    },
  },
  render: (args) => <WeekdaysOnly {...args} />,
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Save' }));
    await expect(
      await canvas.findByText('Selected date unavailable.'),
    ).toBeVisible();
  },
};

export const WithError: Story = {
  args: {
    defaultValue: november,
    errorMessage: 'Choose at most three nights.',
  },
};

/** Neither date nor the button takes the keyboard. */
export const Disabled: Story = {
  args: { defaultValue: november, isDisabled: true },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('button', { name: /Calendar/ }),
    ).toBeDisabled();
    for (const segment of canvas.getAllByRole('spinbutton')) {
      await expect(segment).toHaveAttribute('aria-disabled', 'true');
    }
  },
};

/** The range can be read, but neither typed over nor chosen: the button does not open. */
export const ReadOnly: Story = {
  args: { defaultValue: november, isReadOnly: true },
  play: async ({ canvas, canvasElement, userEvent }) => {
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole('button', { name: /Calendar/ }));
    await expect(page.queryByRole('dialog')).not.toBeInTheDocument();
  },
};

/** In German, through React Aria's `I18nProvider`: both dates follow it. */
export const German: Story = {
  args: { label: 'Reisedaten', defaultValue: november },
  render: (args) => (
    <I18nProvider locale='de-DE'>
      <DateRangePicker {...args} />
    </I18nProvider>
  ),
  play: async ({ canvas }) => {
    const segments = canvas.getAllByRole('spinbutton');
    await expect(segments[0]?.parentElement).toHaveTextContent('10.11.2026');
    await expect(segments[3]?.parentElement).toHaveTextContent('13.11.2026');

    // The dash between the dates is a border, which forced colors keep as a line.
    // The dash stands between the two dates' segments, as a child of their row.
    const dash = canvas
      .getByRole('group')
      .querySelector(':scope > div > span[aria-hidden]');
    if (dash === null) {
      throw new Error('The date range picker draws no dash between its dates.');
    }
    const style = getComputedStyle(dash);
    await expect(style.borderTopStyle).toBe('solid');
    await expect(style.borderTopWidth).toBe('1px');
  },
};

/** A required range whose value the app can set, such as from a preset. */
const RequiredWithPreset = (args: DateRangePickerProps<CalendarDate>) => {
  const [value, setValue] = useState<RangeValue<CalendarDate> | null>(null);
  return (
    <Form onSubmit={() => undefined}>
      <DateRangePicker {...args} isRequired value={value} onChange={setValue} />
      <div className='flex gap-2'>
        <Button onPress={() => setValue(november)}>
          Use 10 to 13 November
        </Button>
        <Button type='submit'>Save</Button>
      </div>
    </Form>
  );
};

/**
 * The shown error follows a value set from code: Save on the empty required range shows its
 * error, and a preset that fills it clears the error at once.
 */
export const SetFromCode: Story = {
  render: (args) => <RequiredWithPreset {...args} />,
  play: async ({ canvas, userEvent }) => {
    const firstSegment = () => canvas.getAllByRole('spinbutton')[0];
    await userEvent.click(canvas.getByRole('button', { name: 'Save' }));
    await waitFor(async () => {
      await expect(firstSegment()).toHaveAttribute('aria-invalid', 'true');
    });
    await userEvent.click(
      canvas.getByRole('button', { name: 'Use 10 to 13 November' }),
    );
    await waitFor(async () => {
      await expect(firstSegment()).not.toHaveAttribute('aria-invalid');
    });
  },
};

/**
 * One focus ring at a time: the box's while a segment of the two dates holds the keyboard focus, the
 * calendar button's own when Tab reaches it.
 */
export const FocusRings: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const box = canvas.getByRole('group');
    const button = canvas.getByRole('button', { name: /Calendar/ });
    await userEvent.tab();
    await expect(canvas.getAllByRole('spinbutton')[0]).toHaveFocus();
    await expect(ringOf(box).width).toBe(2);

    // Tab within the box, across the other segments, to the calendar button.
    for (let segment = 1; segment <= 6; segment += 1) {
      await userEvent.tab();
    }
    await expect(button).toHaveFocus();
    await expect(ringOf(box).width).toBe(0);
    await expect(ringOf(button).width).toBe(2);
    const clearance = ringClearance(button, box);
    await expect(clearance.top).toBeGreaterThanOrEqual(0);
    await expect(clearance.bottom).toBeGreaterThanOrEqual(0);
    await expect(clearance.end).toBeGreaterThanOrEqual(0);
  },
};
