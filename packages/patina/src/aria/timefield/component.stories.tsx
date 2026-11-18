import { parseTime, type Time } from '@internationalized/date';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { I18nProvider } from 'react-aria-components';
import { expect, waitFor } from 'storybook/test';

import { Button } from '../button/index.ts';
import { Form } from '../form/index.ts';
import { TimeField, type TimeFieldProps } from './index.ts';

const meta = {
  title: 'Aria/TimeField',
  component: TimeField<Time>,
  args: { label: 'Start time' },
  decorators: [
    (Story) => (
      <div className='w-64'>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<TimeFieldProps<Time>>;

export default meta;
type Story = StoryObj<TimeFieldProps<Time>>;

/** A time field and a line that shows the value it gives, so a test reads what was typed. */
const TimeFieldWithValue = (props: TimeFieldProps<Time>) => {
  const [value, setValue] = useState<Time | null>(props.defaultValue ?? null);
  return (
    <div className='flex flex-col gap-2'>
      <TimeField
        {...props}
        defaultValue={undefined}
        value={value}
        onChange={setValue}
      />
      <p role='status' className='text-canvas-foreground-muted text-xs'>
        {value === null ? 'No time' : value.toString()}
      </p>
    </div>
  );
};

/** The kinds of segment shown, in order, from React Aria's `data-type`. */
const segmentTypes = (segments: HTMLElement[]) =>
  segments.map((segment) => segment.dataset.type);

/**
 * Empty, typed with the keyboard: hours, minutes, then the day period, where P chooses PM. The
 * arrows step the focused segment.
 */
export const Default: Story = {
  render: (args) => <TimeFieldWithValue {...args} />,
  play: async ({ canvas, userEvent }) => {
    const [hour, minute, dayPeriod] = canvas.getAllByRole('spinbutton');
    await userEvent.tab();
    await expect(hour).toHaveFocus();
    // No hour of a 12-hour clock starts with 9 and has a second digit.
    await userEvent.keyboard('9');
    await expect(minute).toHaveFocus();
    await userEvent.keyboard('30');
    await expect(dayPeriod).toHaveFocus();
    await userEvent.keyboard('p');
    await expect(canvas.getByRole('status')).toHaveTextContent('21:30:00');

    await userEvent.keyboard('{ArrowLeft}{ArrowUp}');
    await expect(minute).toHaveFocus();
    await expect(canvas.getByRole('status')).toHaveTextContent('21:31:00');
  },
};

export const WithValue: Story = { args: { defaultValue: parseTime('14:45') } };

/** `granularity='hour'`: only the hour and the day period. */
export const HourGranularity: Story = {
  args: { defaultValue: parseTime('09:00'), granularity: 'hour' },
  play: async ({ canvas }) => {
    await expect(segmentTypes(canvas.getAllByRole('spinbutton'))).toEqual([
      'hour',
      'dayPeriod',
    ]);
  },
};

/** `granularity='second'`: down to the second. */
export const SecondGranularity: Story = {
  args: { defaultValue: parseTime('09:15:42'), granularity: 'second' },
  play: async ({ canvas }) => {
    await expect(segmentTypes(canvas.getAllByRole('spinbutton'))).toEqual([
      'hour',
      'minute',
      'second',
      'dayPeriod',
    ]);
  },
};

/** A 24-hour clock, whatever the locale: no day period. */
export const TwentyFourHour: Story = {
  args: { defaultValue: parseTime('17:30'), hourCycle: 24 },
  play: async ({ canvas }) => {
    const [hour] = canvas.getAllByRole('spinbutton');
    await expect(hour).toHaveAttribute('aria-valuenow', '17');
    await expect(canvas.getAllByRole('spinbutton')).toHaveLength(2);
  },
};

/**
 * Bounded to office hours: a time outside them shows React Aria's own message once the field is
 * left, here by pressing Save.
 */
export const WithBounds: Story = {
  args: {
    minValue: parseTime('09:00'),
    maxValue: parseTime('17:00'),
    description: 'Between 9 AM and 5 PM.',
  },
  render: (args) => (
    <Form onSubmit={() => undefined}>
      <TimeField {...args} />
      <Button type='submit' className='self-start'>
        Save
      </Button>
    </Form>
  ),
  play: async ({ canvas, userEvent }) => {
    const [hour] = canvas.getAllByRole('spinbutton');
    if (hour === undefined) {
      throw new Error('The time field shows no segments.');
    }
    await userEvent.click(hour);
    await userEvent.keyboard('815a');
    await userEvent.click(canvas.getByRole('button', { name: 'Save' }));
    await expect(
      await canvas.findByText('Value must be 9:00 AM or later.'),
    ).toBeVisible();
  },
};

export const WithError: Story = {
  args: {
    defaultValue: parseTime('07:00'),
    errorMessage: 'Choose a time after the doors open.',
  },
};

export const Disabled: Story = {
  args: { defaultValue: parseTime('14:45'), isDisabled: true },
  play: async ({ canvas, userEvent }) => {
    await userEvent.tab();
    for (const segment of canvas.getAllByRole('spinbutton')) {
      await expect(segment).not.toHaveFocus();
      await expect(segment).toHaveAttribute('aria-disabled', 'true');
    }
  },
};

export const ReadOnly: Story = {
  args: { defaultValue: parseTime('14:45'), isReadOnly: true },
  render: (args) => <TimeFieldWithValue {...args} />,
  play: async ({ canvas, userEvent }) => {
    await userEvent.tab();
    await userEvent.keyboard('{ArrowUp}');
    await expect(canvas.getByRole('status')).toHaveTextContent('14:45:00');
  },
};

/** In German, through React Aria's `I18nProvider`: a 24-hour clock, with no day period. */
export const German: Story = {
  args: { label: 'Startzeit', defaultValue: parseTime('14:45') },
  render: (args) => (
    <I18nProvider locale='de-DE'>
      <TimeField {...args} />
    </I18nProvider>
  ),
  play: async ({ canvas }) => {
    const segments = canvas.getAllByRole('spinbutton');
    await expect(segments).toHaveLength(2);
    await expect(segments[0]?.parentElement).toHaveTextContent('14:45');
  },
};

/** A required field whose value the app can set, such as from a preset. */
const RequiredWithPreset = (args: TimeFieldProps<Time>) => {
  const [value, setValue] = useState<Time | null>(null);
  return (
    <Form onSubmit={() => undefined}>
      <TimeField {...args} isRequired value={value} onChange={setValue} />
      <div className='flex gap-2'>
        <Button onPress={() => setValue(parseTime('09:30'))}>Use 9:30</Button>
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
    await userEvent.click(canvas.getByRole('button', { name: 'Use 9:30' }));
    await waitFor(async () => {
      await expect(firstSegment()).not.toHaveAttribute('aria-invalid');
    });
  },
};
