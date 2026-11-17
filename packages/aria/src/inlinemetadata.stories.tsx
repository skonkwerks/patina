import type { Meta, StoryObj } from '@storybook/react-vite';

import { InlineMetadata } from './inlinemetadata.tsx';

const meta = {
  title: 'Aria/InlineMetadata',
  component: InlineMetadata,
  args: {
    items: [
      { id: 'owner', value: 'Ada Lovelace' },
      { id: 'updated', value: 'Updated 2 hours ago' },
      { id: 'size', value: '14 files' },
    ],
  },
} satisfies Meta<typeof InlineMetadata>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Extra-small, under a row's name. */
export const UnderAName: Story = {
  render: (args) => (
    <div className='flex flex-col gap-0.5'>
      <span className='text-surface-foreground text-sm font-medium'>
        Quarterly report
      </span>
      <InlineMetadata {...args} />
    </div>
  ),
};

/** Body size, for a line that stands on its own. */
export const BodySize: Story = { args: { size: 'md' } };

export const SingleItem: Story = {
  args: { items: [{ id: 'owner', value: 'Ada Lovelace' }] },
};

/** A value can be an element, such as a command in code. */
export const WithElementValue: Story = {
  args: {
    items: [
      { id: 'runtime', value: 'Node 24' },
      { id: 'command', value: <code>pnpm storybook</code> },
    ],
  },
};

/** Long values wrap to the next line and each is cut where it ends. */
export const Narrow: Story = {
  decorators: [
    (Story) => (
      <div className='w-48'>
        <Story />
      </div>
    ),
  ],
};
