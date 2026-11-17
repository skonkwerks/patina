import type { Meta, StoryObj } from '@storybook/react-vite';

import { PendingStatus, Spinner } from './spinner.tsx';

const sizes = ['sm', 'md', 'lg'] as const;

const meta = {
  title: 'Aria/Spinner',
  component: Spinner,
  argTypes: { size: { control: 'select', options: sizes } },
} satisfies Meta<typeof Spinner>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Decoration beside text that already says it is working: hidden from assistive technology. */
export const Decorative: Story = {};

/** Standing on its own, with a label as its accessible name. */
export const Labeled: Story = { args: { label: 'Loading', size: 'lg' } };

/** Larger than `lg`, for a spinner that stands alone on a page: size it with `className`. */
export const Large: Story = { args: { label: 'Loading', className: 'size-8' } };

export const AllSizes: Story = {
  render: (args) => (
    <div className='text-surface-foreground flex items-end gap-4'>
      {sizes.map((size) => (
        <Spinner key={size} {...args} size={size} />
      ))}
    </div>
  ),
};

/** Takes the color of the text it stands in. */
export const InheritsColor: Story = {
  render: (args) => (
    <div className='flex items-center gap-4'>
      <span className='text-primary'>
        <Spinner {...args} size='lg' />
      </span>
      <span className='text-destructive'>
        <Spinner {...args} size='lg' />
      </span>
      <span className='text-success'>
        <Spinner {...args} size='lg' />
      </span>
    </div>
  ),
};

/** What a surface shows while it waits: the spinner and the word that says so. */
export const Status: Story = {
  render: () => (
    <PendingStatus
      text='Loading projects'
      className='text-canvas-foreground-muted'
    />
  ),
};
