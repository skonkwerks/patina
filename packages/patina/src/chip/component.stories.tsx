import type { Meta, StoryObj } from '@storybook/react-vite';

import { Chip, type StatusTone } from './index.ts';

const tones = [
  'neutral',
  'info',
  'success',
  'warning',
  'error',
] as const satisfies readonly StatusTone[];

const meta = {
  title: 'Core/Chip',
  component: Chip,
  args: { children: 'Draft' },
  argTypes: { tone: { control: 'select', options: tones } },
} satisfies Meta<typeof Chip>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A plain category: a surface chip with a border. */
export const Neutral: Story = {};

/** Every tone, each with its own words: the color is never the only signal. */
export const Tones: Story = {
  render: () => (
    <div className='flex flex-wrap items-center gap-2'>
      <Chip tone='neutral'>Draft</Chip>
      <Chip tone='info'>Running</Chip>
      <Chip tone='success'>Published</Chip>
      <Chip tone='warning'>Expiring soon</Chip>
      <Chip tone='error'>Failed</Chip>
    </div>
  ),
};

/** Beside a row's title, where a chip usually stands. */
export const BesideATitle: Story = {
  render: () => (
    <div className='bg-surface border-surface-border flex items-center gap-2 rounded-lg border p-4'>
      <span className='text-surface-foreground text-sm font-medium'>
        Quarterly report
      </span>
      <Chip tone='success'>Published</Chip>
      <Chip>Finance</Chip>
    </div>
  ),
};
