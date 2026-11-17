import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  IconCheck,
  IconChevronDown,
  IconChevronRight,
  IconChevronUp,
  IconDotsVertical,
  IconDownload,
  IconInfoCircle,
  IconSearch,
  IconX,
} from './icons.tsx';

const icons = {
  IconCheck,
  IconChevronDown,
  IconChevronRight,
  IconChevronUp,
  IconDotsVertical,
  IconDownload,
  IconInfoCircle,
  IconSearch,
  IconX,
};

const meta = {
  title: 'Aria/Icons',
  component: IconCheck,
} satisfies Meta<typeof IconCheck>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Every icon the wrappers draw, in the current text color. */
export const All: Story = {
  render: (args) => (
    <ul className='text-surface-foreground grid grid-cols-[repeat(auto-fill,minmax(9rem,1fr))] gap-3'>
      {Object.entries(icons).map(([name, Icon]) => (
        <li
          key={name}
          className='border-surface-border bg-surface flex flex-col items-center gap-2 rounded-md border p-4'
        >
          <Icon {...args} aria-hidden className='h-6 w-6' />
          <span className='text-surface-foreground-muted text-xs'>{name}</span>
        </li>
      ))}
    </ul>
  ),
};

/** Sized by class and colored by the text around them. */
export const SizesAndColors: Story = {
  render: (args) => (
    <div className='flex items-center gap-4'>
      <IconInfoCircle {...args} aria-hidden className='text-info h-4 w-4' />
      <IconInfoCircle {...args} aria-hidden className='text-primary h-6 w-6' />
      <IconInfoCircle
        {...args}
        aria-hidden
        className='text-destructive h-8 w-8'
      />
    </div>
  ),
};
