import type { Meta, StoryObj } from '@storybook/react-vite';
import { IconSearch, IconX } from '@tabler/icons-react';

import { IconButton } from './index.js';

const meta = {
  title: 'Aria/IconButton',
  component: IconButton,
  args: {
    'aria-label': 'Search',
    children: <IconSearch aria-hidden className='size-4' />,
  },
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    variant: { control: 'select', options: ['solid', 'outline', 'ghost'] },
    tone: { control: 'select', options: ['neutral', 'primary', 'destructive'] },
    radius: { control: 'select', options: ['md', 'full'] },
  },
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Ghost and neutral by default: no fill until hovered. */
export const Default: Story = {};

/** The three sizes, matching the button scale. */
export const Sizes: Story = {
  render: (args) => (
    <div className='flex items-center gap-3'>
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <IconButton key={size} {...args} size={size} />
      ))}
    </div>
  ),
};

/** Round, for a close control. */
export const Round: Story = {
  args: {
    'aria-label': 'Close',
    radius: 'full',
    children: <IconX aria-hidden className='size-4' />,
  },
};

/** Outline and solid looks, for an icon action that needs more weight. */
export const Variants: Story = {
  render: (args) => (
    <div className='flex items-center gap-3'>
      <IconButton {...args} variant='ghost' />
      <IconButton {...args} variant='outline' />
      <IconButton {...args} variant='solid' tone='primary' />
      <IconButton
        {...args}
        variant='ghost'
        tone='destructive'
        aria-label='Remove'
      >
        <IconX aria-hidden className='size-4' />
      </IconButton>
    </div>
  ),
};

/** Shows its name as a tooltip on hover and focus, for an icon that may not say enough alone. */
export const WithTooltip: Story = { args: { hasTooltip: true } };

/** Pending: the spinner stands in place of the icon, in the same square. */
export const Pending: Story = { args: { isPending: true } };

/** Disabled with nothing to say: dimmed and skipped by Tab. */
export const Disabled: Story = { args: { isDisabled: true } };

/** Disabled with a reason: stays focusable and says why on hover and focus. */
export const DisabledWithReason: Story = {
  args: { disabledReason: 'Type at least two letters to search.' },
};
