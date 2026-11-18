import type { Meta, StoryObj } from '@storybook/react-vite';

import { Link, LinkButton } from './index.js';

const meta = {
  title: 'Aria/Link',
  component: Link,
  args: { href: '#', children: 'Read the guide' },
} satisfies Meta<typeof Link>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Inside a line of text. */
export const InText: Story = {
  render: (args) => (
    <p className='text-canvas-foreground max-w-md text-sm'>
      Exports run overnight and are kept for a week. <Link {...args} /> to
      schedule them for another time.
    </p>
  ),
};

export const Disabled: Story = { args: { isDisabled: true } };

/** `LinkButton`: a navigation that looks like a `Button`, in each of its common variants. */
export const AsButton: Story = {
  render: (args) => (
    <div className='flex flex-wrap items-center gap-3'>
      <LinkButton href={args.href} variant='solid' tone='primary'>
        Create project
      </LinkButton>
      <LinkButton href={args.href} variant='outline'>
        View all
      </LinkButton>
      <LinkButton href={args.href} variant='ghost'>
        Settings
      </LinkButton>
      <LinkButton href={args.href} variant='outline' size='sm'>
        Small
      </LinkButton>
    </div>
  ),
};
