import {
  type CalendarDate,
  isWeekend,
  parseDate,
} from '@internationalized/date';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { I18nProvider, useLocale } from 'react-aria-components';
import { expect, waitFor, within } from 'storybook/test';

import { Button } from '../button/index.js';
import { dayName, ringOf } from '../calendar/month.testing.js';
import { Form } from '../form/index.js';
import { DatePicker, type DatePickerProps } from './index.js';
import { ringClearance } from './picker.testing.js';

const meta = {
  title: 'Aria/DatePicker',
  component: DatePicker<CalendarDate>,
  args: { label: 'Event date' },
  decorators: [
    (Story) => (
      <div className='w-64'>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<DatePickerProps<CalendarDate>>;

export default meta;
type Story = StoryObj<DatePickerProps<CalendarDate>>;

/** A date picker and a line that shows the value it gives, so a test reads what was chosen. */
const DatePickerWithValue = (props: DatePickerProps<CalendarDate>) => {
  const [value, setValue] = useState<CalendarDate | null>(
    props.defaultValue ?? null,
  );
  return (
    <div className='flex flex-col gap-2'>
      <DatePicker
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

export const Default: Story = {};

/**
 * The calendar button opens the calendar on the chosen day; the arrows move and Enter chooses,
 * which closes the calendar and gives the focus back to the button.
 */
export const WithValue: Story = {
  args: { defaultValue: parseDate('2026-11-18') },
  render: (args) => <DatePickerWithValue {...args} />,
  play: async ({ canvas, canvasElement, userEvent }) => {
    const page = within(canvasElement.ownerDocument.body);
    const button = canvas.getByRole('button', { name: /Calendar/ });
    await userEvent.click(button);
    const dialog = await page.findByRole('dialog');
    await waitFor(async () => {
      await expect(
        within(dialog).getByRole('button', {
          name: dayName('November 18, 2026'),
        }),
      ).toHaveFocus();
    });

    await userEvent.keyboard('{ArrowRight}{Enter}');
    await waitFor(async () => {
      await expect(page.queryByRole('dialog')).not.toBeInTheDocument();
    });
    await expect(canvas.getByRole('status')).toHaveTextContent('2026-11-19');
    await expect(button).toHaveFocus();
  },
};

/**
 * From the field, Alt+Down Arrow opens the calendar; Escape closes it and gives the focus back to
 * the segment it came from, with the value unchanged.
 */
export const KeyboardOpen: Story = {
  args: { defaultValue: parseDate('2026-11-18') },
  render: (args) => <DatePickerWithValue {...args} />,
  play: async ({ canvas, canvasElement, userEvent }) => {
    const page = within(canvasElement.ownerDocument.body);
    const [month] = canvas.getAllByRole('spinbutton');
    if (month === undefined) {
      throw new Error('The date picker shows no segments.');
    }
    await userEvent.click(month);
    await userEvent.keyboard('{Alt>}{ArrowDown}{/Alt}');
    const dialog = await page.findByRole('dialog');
    await waitFor(async () => {
      await expect(
        within(dialog).getByRole('button', {
          name: dayName('November 18, 2026'),
        }),
      ).toHaveFocus();
    });
    await userEvent.keyboard('{ArrowDown}{Escape}');
    await waitFor(async () => {
      await expect(page.queryByRole('dialog')).not.toBeInTheDocument();
    });
    await expect(month).toHaveFocus();
    await expect(canvas.getByRole('status')).toHaveTextContent('2026-11-18');
  },
};

/** Bounded: the calendar's days outside the bounds take the disabled look. */
export const WithBounds: Story = {
  args: {
    defaultValue: parseDate('2026-11-18'),
    minValue: parseDate('2026-11-10'),
    maxValue: parseDate('2026-11-25'),
    description: 'Between 10 and 25 November.',
  },
  play: async ({ canvas, canvasElement, userEvent }) => {
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole('button', { name: /Calendar/ }));
    const dialog = await page.findByRole('dialog');
    await expect(
      within(dialog).getByRole('button', { name: dayName('November 9, 2026') }),
    ).toHaveAttribute('aria-disabled', 'true');
  },
};

/** Weekends cannot be chosen, by the locale's own weekend. */
const WeekdaysOnly = (props: DatePickerProps<CalendarDate>) => {
  const { locale } = useLocale();
  return (
    <Form onSubmit={() => undefined}>
      <DatePicker
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
 * An unavailable day is struck through in the calendar, and one typed into the field shows React
 * Aria's own message when the form is submitted.
 */
export const UnavailableDates: Story = {
  args: { defaultValue: parseDate('2026-11-21') },
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
    defaultValue: parseDate('2026-11-18'),
    errorMessage: 'Choose a date after the registration closes.',
  },
};

/** Neither the field nor the button takes the keyboard. */
export const Disabled: Story = {
  args: { defaultValue: parseDate('2026-11-18'), isDisabled: true },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('button', { name: /Calendar/ }),
    ).toBeDisabled();
    for (const segment of canvas.getAllByRole('spinbutton')) {
      await expect(segment).toHaveAttribute('aria-disabled', 'true');
    }
  },
};

/** The value can be read, but neither typed over nor chosen: the button does not open. */
export const ReadOnly: Story = {
  args: { defaultValue: parseDate('2026-11-18'), isReadOnly: true },
  play: async ({ canvas, canvasElement, userEvent }) => {
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole('button', { name: /Calendar/ }));
    await expect(page.queryByRole('dialog')).not.toBeInTheDocument();
  },
};

/** In German, through React Aria's `I18nProvider`: the field and the calendar both follow it. */
export const German: Story = {
  args: { label: 'Termin', defaultValue: parseDate('2026-11-18') },
  render: (args) => (
    <I18nProvider locale='de-DE'>
      <DatePicker {...args} />
    </I18nProvider>
  ),
  play: async ({ canvas, canvasElement, userEvent }) => {
    const page = within(canvasElement.ownerDocument.body);
    const [day] = canvas.getAllByRole('spinbutton');
    await expect(day?.parentElement).toHaveTextContent('18.11.2026');
    await userEvent.click(canvas.getByRole('button', { name: /Kalender/ }));
    const dialog = await page.findByRole('dialog');
    await expect(
      within(dialog).getByRole('button', {
        name: dayName('18. November 2026'),
      }),
    ).toBeVisible();
  },
};

/** A required picker whose value the app can set, such as from a preset. */
const RequiredWithPreset = (args: DatePickerProps<CalendarDate>) => {
  const [value, setValue] = useState<CalendarDate | null>(null);
  return (
    <Form onSubmit={() => undefined}>
      <DatePicker {...args} isRequired value={value} onChange={setValue} />
      <div className='flex gap-2'>
        <Button onPress={() => setValue(parseDate('2026-11-18'))}>
          Use 18 November
        </Button>
        <Button type='submit'>Save</Button>
      </div>
    </Form>
  );
};

/**
 * The shown error follows a value set from code: Save on the empty required picker shows its
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
      canvas.getByRole('button', { name: 'Use 18 November' }),
    );
    await waitFor(async () => {
      await expect(firstSegment()).not.toHaveAttribute('aria-invalid');
    });
  },
};

/**
 * One focus ring at a time: the box's while a segment of the date holds the keyboard focus, the
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
    for (let segment = 1; segment <= 3; segment += 1) {
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
