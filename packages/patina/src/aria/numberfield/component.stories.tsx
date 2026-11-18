import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { NumberField } from './index.js';

const meta = {
  title: 'Aria/NumberField',
  component: NumberField,
  args: { label: 'Quantity', defaultValue: 1 },
} satisfies Meta<typeof NumberField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Bounded: the steppers stop at the limits. */
export const WithBounds: Story = {
  args: {
    minValue: 0,
    maxValue: 10,
    description: 'Between 0 and 10.',
  },
};

export const Step: Story = {
  args: {
    label: 'Opacity',
    defaultValue: 0.5,
    step: 0.1,
    minValue: 0,
    maxValue: 1,
  },
};

export const Currency: Story = {
  args: {
    label: 'Price',
    defaultValue: 19.99,
    formatOptions: { style: 'currency', currency: 'USD' },
  },
};

export const Percent: Story = {
  args: {
    label: 'Discount',
    defaultValue: 0.15,
    formatOptions: { style: 'percent' },
  },
};

export const WithError: Story = {
  args: { errorMessage: 'Not enough in stock.' },
};

export const Disabled: Story = { args: { isDisabled: true } };

export const ReadOnly: Story = { args: { isReadOnly: true } };

export const Controlled: Story = {
  render: function Render(args) {
    const [value, setValue] = useState(3);
    return (
      <div className='flex flex-col gap-2'>
        <NumberField {...args} value={value} onChange={setValue} />
        <p className='text-surface-foreground-muted text-xs'>Value: {value}</p>
      </div>
    );
  },
};
