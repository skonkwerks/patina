import type { Meta, StoryObj } from '@storybook/react-vite';
import { Dialog, DialogTrigger, Heading } from 'react-aria-components';

import { Popover } from '../../aria/popover/index.js';
import { InfoButton } from './index.js';

const meta = {
  title: 'Composites/InfoButton',
  component: InfoButton,
  args: { 'aria-label': 'About storage' },
} satisfies Meta<typeof InfoButton>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Beside a heading, the size it is made for. */
export const Default: Story = {
  render: (args) => (
    <div className='flex items-center gap-1'>
      <h2 className='text-canvas-foreground text-lg font-semibold'>Storage</h2>
      <InfoButton {...args} />
    </div>
  ),
};

/** Shows its name as a tooltip on hover and focus. */
export const WithTooltip: Story = { ...Default, args: { hasTooltip: true } };

/** Opening a popover with more information, a common use. */
export const OpensPopover: Story = {
  render: (args) => (
    <div className='flex items-center gap-1'>
      <h2 className='text-canvas-foreground text-lg font-semibold'>Storage</h2>
      <DialogTrigger>
        <InfoButton {...args} />
        <Popover placement='bottom start'>
          <Dialog className='max-w-64 p-3 text-sm outline-0'>
            <Heading slot='title' className='font-medium'>
              About storage
            </Heading>
            <p className='text-overlay-foreground-muted mt-1'>
              Every version of every file counts toward the workspace&apos;s
              storage.
            </p>
          </Dialog>
        </Popover>
      </DialogTrigger>
    </div>
  ),
};

export const DisabledWithReason: Story = {
  args: { disabledReason: 'Help is not available offline.' },
};
