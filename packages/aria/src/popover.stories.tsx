import type { Meta, StoryObj } from '@storybook/react-vite';
import { Dialog, DialogTrigger, Heading } from 'react-aria-components';

import { Button } from './button.tsx';
import { Popover } from './popover.tsx';

const meta = {
  title: 'Aria/Popover',
  component: Popover,
  args: { placement: 'bottom' },
  argTypes: {
    placement: {
      control: 'select',
      options: ['top', 'bottom', 'left', 'right', 'bottom start', 'bottom end'],
    },
  },
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A button that opens the popover; the popover holds a small dialog, as most popovers do. */
export const Default: Story = {
  render: (args) => (
    <DialogTrigger>
      <Button>Show details</Button>
      <Popover {...args}>
        <Dialog className='flex max-w-64 flex-col gap-1 p-3 text-sm outline-0'>
          <Heading slot='title' className='font-medium'>
            Storage
          </Heading>
          <p className='text-overlay-foreground-muted'>
            12.4 GB of 50 GB used. Older versions are removed after 30 days.
          </p>
        </Dialog>
      </Popover>
    </DialogTrigger>
  ),
};

export const Top: Story = { ...Default, args: { placement: 'top' } };

export const Right: Story = { ...Default, args: { placement: 'right' } };
