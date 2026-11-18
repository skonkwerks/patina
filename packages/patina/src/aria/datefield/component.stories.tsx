import { type CalendarDate, parseDate } from '@internationalized/date';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { I18nProvider } from 'react-aria-components';
import { expect, waitFor } from 'storybook/test';

import { Button } from '../button/index.ts';
import { Form } from '../form/index.ts';
import { DateField, type DateFieldProps } from './index.ts';

const meta = {
  title: 'Aria/DateField',
  component: DateField<CalendarDate>,
  args: { label: 'Start date' },
  decorators: [
    (Story) => (
      <div className='w-64'>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<DateFieldProps<CalendarDate>>;

export default meta;
type Story = StoryObj<DateFieldProps<CalendarDate>>;

/** A date field and a line that shows the value it gives, so a test reads what was typed. */
const DateFieldWithValue = (props: DateFieldProps<CalendarDate>) => {
  const [value, setValue] = useState<CalendarDate | null>(
    props.defaultValue ?? null,
  );
  return (
    <div className='flex flex-col gap-2'>
      <DateField
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
 * Empty, as a new form shows it. Typed with the keyboard: digits fill the focused segment and move
 * on once it cannot take another digit, the arrows step it, and the left and right arrows move
 * between segments.
 */
export const Default: Story = {
  render: (args) => <DateFieldWithValue {...args} />,
  play: async ({ canvas, userEvent }) => {
    const [month, day, year] = canvas.getAllByRole('spinbutton');
    if (month === undefined || day === undefined || year === undefined) {
      throw new Error('The date field shows no month, day and year.');
    }

    // Under forced colors a placeholder segment is `GrayText` and a filled one `FieldText`. The
    // story runs without forced colors, so the classes are what can be checked here.
    await expect(day).toHaveClass('forced-colors:text-[GrayText]');
    await expect(day).not.toHaveClass('forced-colors:text-[FieldText]');

    await userEvent.tab();
    await expect(month).toHaveFocus();
    // No month starts with 3 and has a second digit, so the field moves on to the day.
    await userEvent.keyboard('3');
    await expect(day).toHaveFocus();
    await userEvent.keyboard('14');
    await expect(year).toHaveFocus();
    await userEvent.keyboard('2026');
    await expect(canvas.getByRole('status')).toHaveTextContent('2026-03-14');
    await expect(day).toHaveClass('forced-colors:text-[FieldText]');

    // The arrows step the focused segment; the left arrow moves back one.
    await userEvent.keyboard('{ArrowUp}');
    await expect(canvas.getByRole('status')).toHaveTextContent('2027-03-14');
    await userEvent.keyboard('{ArrowLeft}');
    await expect(day).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}{ArrowDown}');
    await expect(canvas.getByRole('status')).toHaveTextContent('2027-03-12');
  },
};

export const WithValue: Story = {
  args: { defaultValue: parseDate('2026-11-18') },
};

export const WithDescription: Story = {
  args: { description: 'The first day the plan applies.' },
};

/**
 * Bounded: a date outside the range shows React Aria's own message once the field is left, here
 * by pressing Save, which also refuses to submit.
 */
export const WithBounds: Story = {
  args: {
    minValue: parseDate('2026-11-01'),
    maxValue: parseDate('2026-11-30'),
    description: 'A day in November 2026.',
  },
  render: (args) => (
    <Form onSubmit={() => undefined}>
      <DateField {...args} />
      <Button type='submit' className='self-start'>
        Save
      </Button>
    </Form>
  ),
  play: async ({ canvas, userEvent }) => {
    const [month] = canvas.getAllByRole('spinbutton');
    if (month === undefined) {
      throw new Error('The date field shows no segments.');
    }
    await userEvent.click(month);
    await userEvent.keyboard('12012026');
    await userEvent.click(canvas.getByRole('button', { name: 'Save' }));
    await expect(
      await canvas.findByText('Value must be 11/30/2026 or earlier.'),
    ).toBeVisible();
    for (const segment of canvas.getAllByRole('spinbutton')) {
      await expect(segment).toHaveAttribute('aria-invalid', 'true');
    }
  },
};

/** The app's own error, which also marks the field invalid. */
export const WithError: Story = {
  args: {
    defaultValue: parseDate('2026-11-18'),
    errorMessage: 'Choose a date after the plan starts.',
  },
};

/** Out of the focus order: no segment takes the keyboard. */
export const Disabled: Story = {
  args: { defaultValue: parseDate('2026-11-18'), isDisabled: true },
  play: async ({ canvas, userEvent }) => {
    await userEvent.tab();
    for (const segment of canvas.getAllByRole('spinbutton')) {
      await expect(segment).not.toHaveFocus();
      await expect(segment).toHaveAttribute('aria-disabled', 'true');
    }
  },
};

/** The segments take the focus, so the value can be read, but the arrows change nothing. */
export const ReadOnly: Story = {
  args: { defaultValue: parseDate('2026-11-18'), isReadOnly: true },
  render: (args) => <DateFieldWithValue {...args} />,
  play: async ({ canvas, userEvent }) => {
    await userEvent.tab();
    await expect(canvas.getAllByRole('spinbutton')[0]).toHaveFocus();
    await userEvent.keyboard('{ArrowUp}5');
    await expect(canvas.getByRole('status')).toHaveTextContent('2026-11-18');
  },
};

/** A date with its time: `granularity` sets the smallest segment shown. */
export const WithTime: Story = {
  args: {
    label: 'Starts at',
    granularity: 'minute',
  },
};

/**
 * In German, through React Aria's `I18nProvider`: the day comes first and the separators are dots.
 * The value the field gives is the same `CalendarDate` whatever the locale.
 */
export const German: Story = {
  args: { label: 'Startdatum', defaultValue: parseDate('2026-11-18') },
  render: (args) => (
    <I18nProvider locale='de-DE'>
      <DateFieldWithValue {...args} />
    </I18nProvider>
  ),
  play: async ({ canvas, userEvent }) => {
    const [day, month, year] = canvas.getAllByRole('spinbutton');
    await expect(day).toHaveAttribute('aria-valuenow', '18');
    await expect(month).toHaveAttribute('aria-valuenow', '11');
    await expect(year).toHaveAttribute('aria-valuenow', '2026');
    await expect(day?.parentElement).toHaveTextContent('18.11.2026');

    await userEvent.tab();
    await expect(day).toHaveFocus();
    await userEvent.keyboard('{ArrowUp}');
    await expect(canvas.getByRole('status')).toHaveTextContent('2026-11-19');
  },
};

/** A required field whose value the app can set, such as from a preset. */
const RequiredWithPreset = (args: DateFieldProps<CalendarDate>) => {
  const [value, setValue] = useState<CalendarDate | null>(null);
  return (
    <Form onSubmit={() => undefined}>
      <DateField {...args} isRequired value={value} onChange={setValue} />
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
 * The shown error follows a value set from code: Save on the empty required field shows its error,
 * and a preset that fills the field clears it at once, without the field being focused and left.
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
