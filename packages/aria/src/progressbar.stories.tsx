import type { Meta, StoryObj } from '@storybook/react-vite';

import { ProgressBar } from './progressbar.tsx';

const meta = {
  title: 'Aria/ProgressBar',
  component: ProgressBar,
  args: { 'aria-label': 'Uploading', value: 40 },
  decorators: [
    (Story) => (
      <div className='w-72'>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ProgressBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Partial: Story = {};

export const Empty: Story = { args: { value: 0 } };

export const Complete: Story = { args: { value: 100 } };

/** Progress out of a custom range: 3 of 12 files. */
export const CustomRange: Story = {
  args: { minValue: 0, maxValue: 12, value: 3 },
};

/** While how much is left is unknown: a pulsing segment. */
export const Indeterminate: Story = { args: { isIndeterminate: true } };
