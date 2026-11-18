import type { Meta, StoryObj } from '@storybook/react-vite';
import { IconDownload } from '@tabler/icons-react';

import { Button } from '../button/index.js';
import { IconButton } from '../iconbutton/index.js';
import { Link } from '../link/index.js';
import { Tooltip, TooltipTrigger } from './index.js';

const meta = {
  title: 'Aria/Tooltip',
  component: Tooltip,
  args: { children: 'Opens the release notes', placement: 'top' },
  argTypes: {
    placement: {
      control: 'select',
      options: ['top', 'bottom', 'left', 'right'],
    },
  },
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Hover or focus the link to show the tooltip. A `TooltipTrigger` goes around a focusable that has
 * no tooltip of its own, such as a link; buttons carry their own (see On Buttons).
 */
export const Default: Story = {
  render: (args) => (
    <TooltipTrigger>
      <Link href='#release-notes'>Release notes</Link>
      <Tooltip {...args} />
    </TooltipTrigger>
  ),
};

export const Bottom: Story = { ...Default, args: { placement: 'bottom' } };

/** A longer text wraps at the tooltip's maximum width. */
export const LongText: Story = {
  ...Default,
  args: {
    children:
      'Opens what changed in each version. Notes for versions older than a year are in the archive.',
  },
};

/**
 * A `Button` or an `IconButton` carries its own tooltip trigger, so no `TooltipTrigger` is put around
 * one (an outer trigger would never open): a button takes `tooltip`, an icon button `hasTooltip`,
 * which shows its name, and either shows its `disabledReason` while it has one.
 */
export const OnButtons: Story = {
  render: () => (
    <div className='flex items-center gap-3'>
      <Button tooltip='Copies a link anyone in the workspace can open'>
        Copy link
      </Button>
      <IconButton aria-label='Download' hasTooltip>
        <IconDownload aria-hidden className='size-4' />
      </IconButton>
      <Button disabledReason='Choose a file first'>Upload</Button>
    </div>
  ),
};
