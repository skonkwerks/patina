import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import { Button } from '../button/index.ts';
import { Separator } from './index.ts';

const meta = {
  title: 'Aria/Separator',
  component: Separator,
} satisfies Meta<typeof Separator>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Between two parts of a panel, the full width of the panel. It is announced as a separator, and
 * Tab passes over it.
 */
export const Horizontal: Story = {
  render: (args) => (
    <div className='bg-surface text-surface-foreground flex w-80 flex-col gap-3 rounded-lg border p-4 text-sm'>
      <p>Owner: Ada Lovelace</p>
      <Separator {...args} />
      <p>Created 3 days ago</p>
      <div className='flex gap-2'>
        <Button>Edit</Button>
        <Button>Share</Button>
      </div>
    </div>
  ),
  play: async ({ canvas, userEvent }) => {
    const separator = canvas.getByRole('separator');
    await expect(separator).not.toHaveAttribute('aria-orientation');
    const box = separator.getBoundingClientRect();
    await expect(box.height).toBe(1);
    await expect(box.width).toBeGreaterThan(200);

    await userEvent.tab();
    await expect(canvas.getByRole('button', { name: 'Edit' })).toHaveFocus();
    await userEvent.tab();
    await expect(canvas.getByRole('button', { name: 'Share' })).toHaveFocus();
  },
};

/** Between items of a row: one pixel wide, as tall as the row it stands in. */
export const Vertical: Story = {
  args: { orientation: 'vertical' },
  render: (args) => (
    <div className='text-canvas-foreground flex items-center gap-3 text-sm'>
      <span>12 files</span>
      <Separator {...args} />
      <span>4.2 MB</span>
      <Separator {...args} />
      <Button>Download all</Button>
    </div>
  ),
  play: async ({ canvas }) => {
    const [first] = canvas.getAllByRole('separator');
    await expect(first).toHaveAttribute('aria-orientation', 'vertical');
    const box = first?.getBoundingClientRect();
    await expect(box?.width).toBe(1);
    // As tall as the row, which the button sets (32px), not the line of text beside it.
    await expect(box?.height).toBe(
      canvas.getByRole('button', { name: 'Download all' }).offsetHeight,
    );
  },
};
