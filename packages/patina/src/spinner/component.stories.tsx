import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import { Button } from '../aria/button/index.js';
import {
  PendingStatus,
  Spinner,
  type SpinnerGlyphProps,
  SpinnerProvider,
} from './index.js';

const sizes = ['sm', 'md', 'lg'] as const;

const meta = {
  title: 'Core/Spinner',
  component: Spinner,
  argTypes: { size: { control: 'select', options: sizes } },
} satisfies Meta<typeof Spinner>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Decoration beside text that already says it is working: hidden from assistive technology. */
export const Decorative: Story = {};

/** Standing on its own, with an `aria-label` as its accessible name. */
export const Labeled: Story = { args: { 'aria-label': 'Loading', size: 'lg' } };

/** Larger than `lg`, for a spinner that stands alone on a page: size it with `className`. */
export const Large: Story = {
  args: { 'aria-label': 'Loading', className: 'size-8' },
};

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
      <span className='text-error'>
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

/** A stand-in for an app's own glyph: four dots on a ring, fading, drawn in the text's color. */
const DotsGlyph = (props: SpinnerGlyphProps) => (
  <svg viewBox='0 0 24 24' fill='currentColor' data-glyph='dots' {...props}>
    <circle cx='12' cy='3' r='2.5' />
    <circle cx='21' cy='12' r='2.5' opacity='0.75' />
    <circle cx='12' cy='21' r='2.5' opacity='0.5' />
    <circle cx='3' cy='12' r='2.5' opacity='0.25' />
  </svg>
);

/**
 * An app's own glyph, given once by `SpinnerProvider` at its root: every spinner under it draws
 * the app's drawing, a pending button's and `PendingStatus`'s included, with the spinner's sizes,
 * turning, stillness for less motion, and accessible name or hiding.
 */
export const AppGlyph: Story = {
  render: () => (
    <SpinnerProvider renderGlyph={(props) => <DotsGlyph {...props} />}>
      <div className='text-surface-foreground flex items-center gap-4'>
        <Spinner aria-label='Loading' size='lg' />
        <PendingStatus text='Saving' />
        <Button isPending>Save</Button>
      </div>
    </SpinnerProvider>
  ),
  play: async ({ canvas, canvasElement }) => {
    const glyphs = canvasElement.querySelectorAll('svg');
    await expect(glyphs).toHaveLength(3);
    for (const glyph of glyphs) {
      await expect(glyph).toHaveAttribute('data-glyph', 'dots');
      // The spinner's own classes: it turns, and stands still for less motion.
      await expect(glyph).toHaveClass(
        'animate-spin',
        'motion-reduce:animate-none',
      );
    }
    // Standing on its own, it is an image with its name; beside text, it is hidden decoration.
    await expect(canvas.getByRole('img', { name: 'Loading' })).toHaveAttribute(
      'data-glyph',
      'dots',
    );
    await expect(
      canvasElement.querySelectorAll('svg[aria-hidden="true"]'),
    ).toHaveLength(2);
  },
};
