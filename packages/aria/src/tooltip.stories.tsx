import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from './button.tsx';
import { IconButton } from './iconbutton.tsx';
import { IconDownload } from './icons.tsx';
import { Tooltip, TooltipTrigger } from './tooltip.tsx';

const meta = {
  title: 'Aria/Tooltip',
  component: Tooltip,
  args: { children: 'Copies the link to the clipboard', placement: 'top' },
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

/** Hover or focus the button to show the tooltip. */
export const Default: Story = {
  render: (args) => (
    <TooltipTrigger>
      <Button>Copy link</Button>
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
      'Copies a link anyone in the workspace can open. People outside the workspace are asked to sign in first.',
  },
};

/** Around an icon button, where the tooltip names what the icon does. */
export const OnIconButton: Story = {
  args: { children: 'Download' },
  render: (args) => (
    <TooltipTrigger>
      <IconButton aria-label='Download'>
        <IconDownload aria-hidden className='h-5 w-5' />
      </IconButton>
      <Tooltip {...args} />
    </TooltipTrigger>
  ),
};
