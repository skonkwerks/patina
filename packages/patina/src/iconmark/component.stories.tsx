import type { Meta, StoryObj } from '@storybook/react-vite';
import { IconMovie, IconPhoto } from '@tabler/icons-react';

import { IconMark } from './index.js';

const meta = {
  title: 'Core/IconMark',
  component: IconMark,
  args: {
    'aria-label': 'Video',
    children: <IconMovie aria-hidden />,
  },
} satisfies Meta<typeof IconMark>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** In a caption line, at the height of the small text beside it. */
export const InACaption: Story = {
  render: () => (
    <div className='text-surface-foreground flex items-center gap-2 text-xs'>
      <span className='font-medium'>beach-sunset.jpg</span>
      <IconMark aria-label='Photo'>
        <IconPhoto aria-hidden />
      </IconMark>
    </div>
  ),
};
