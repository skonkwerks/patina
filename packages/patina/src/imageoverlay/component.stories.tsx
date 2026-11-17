import type { Meta, StoryObj } from '@storybook/react-vite';
import { IconPlayerPlay, IconStar } from '@tabler/icons-react';

import { ImageOverlay } from './index.ts';

const meta = {
  title: 'Core/ImageOverlay',
  component: ImageOverlay,
  args: {
    'aria-label': 'Favorite',
    children: <IconStar aria-hidden />,
  },
  decorators: [
    (Story) => (
      // A picture stand-in: a dark gradient, the hard case for a marker to read on.
      <div className='relative size-40 overflow-hidden rounded-lg bg-gradient-to-br from-slate-800 to-slate-500'>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ImageOverlay>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A named marker in a corner: an image with a name, read by assistive technology. */
export const Named: Story = {
  args: { className: 'absolute top-2 right-2' },
};

/** An unnamed marker is decoration, hidden from assistive technology, for a meaning said elsewhere. */
export const Decorative: Story = {
  args: {
    'aria-label': undefined,
    children: <IconPlayerPlay aria-hidden />,
    className: 'absolute bottom-2 left-2',
  },
};
