import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { Slider } from './slider.tsx';

const meta = {
  title: 'Aria/Slider',
  component: Slider,
  args: { label: 'Volume', defaultValue: 40 },
  decorators: [
    (Story) => (
      <div className='w-72'>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Slider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithStep: Story = {
  args: { label: 'Rating', minValue: 0, maxValue: 5, step: 1, defaultValue: 3 },
};

export const Disabled: Story = { args: { isDisabled: true } };

/** No visible label: the slider carries `aria-label`. */
export const WithoutVisibleLabel: Story = {
  args: { label: undefined, 'aria-label': 'Volume' },
};

/** `showValue` puts the current value at the end of the label row. */
export const ShowValue: Story = { args: { showValue: true } };

/** The value is formatted for the user's locale with `formatOptions`, here as a percent. */
export const ShowValueAsPercent: Story = {
  args: {
    label: 'Opacity',
    showValue: true,
    minValue: 0,
    maxValue: 1,
    step: 0.01,
    defaultValue: 0.75,
    formatOptions: { style: 'percent' },
  },
};

/** Controlled: the caller holds `value`, and the slider shows it with `showValue`. */
export const Controlled: Story = {
  render: function Render(args) {
    const [value, setValue] = useState(60);
    return <Slider {...args} showValue value={value} onChange={setValue} />;
  },
};
