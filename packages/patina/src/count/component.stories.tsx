import type { Meta, StoryObj } from '@storybook/react-vite';

import { Count } from './index.js';

const meta = {
  title: 'Core/Count',
  component: Count,
  args: { text: '(12)' },
} satisfies Meta<typeof Count>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A count after a label, in the label's color at normal weight; the caller chooses the size relative to it. */
export const AfterLabel: Story = {
  render: (args) => (
    <h2 className='text-canvas-foreground text-lg font-semibold'>
      Projects
      <Count {...args} />
    </h2>
  ),
};

export const Small: Story = {
  render: (args) => (
    <span className='text-canvas-foreground text-sm font-medium'>
      Members
      <Count {...args} text='(3)' className='text-xs' />
    </span>
  ),
};
