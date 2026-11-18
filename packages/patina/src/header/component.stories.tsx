import type { Meta, StoryObj } from '@storybook/react-vite';
import { IconPhoto } from '@tabler/icons-react';
import { expect } from 'storybook/test';

import { Button } from '../aria/button/index.js';
import { Chip } from '../chip/index.js';
import { InfoButton } from '../composites/infobutton/index.js';
import { Header } from './index.js';

const meta = {
  title: 'Core/Header',
  component: Header,
  args: { title: 'Projects' },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Header>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A page's heading: the title with its count, the info control, a badge, and the page's actions. */
export const PageHeading: Story = {
  args: {
    count: '(12)',
    description: 'Everything the team is working on this quarter.',
    info: <InfoButton aria-label='Help with projects' />,
    badges: <Chip tone='success'>Synced</Chip>,
    actions: (
      <>
        <Button>Import</Button>
        <Button variant='solid' tone='primary'>
          New project
        </Button>
      </>
    ),
  },
};

/** A section's heading, one size smaller and an `h2`, with its own action. */
export const Section: Story = {
  args: {
    variant: 'section',
    title: 'Recent activity',
    count: '(4)',
    actions: <Button size='sm'>View all</Button>,
  },
};

/** A section inside a section passes `level={3}`, which keeps the outline correct. */
export const NestedSection: Story = {
  args: { variant: 'section', level: 3, title: 'Uploads this week' },
};

/** Artwork before the title and description, in a square as tall as both. */
export const WithMedia: Story = {
  args: {
    title: 'Spring launch',
    description: 'Campaign assets and their review state.',
    media: (
      <span className='bg-surface-hover text-surface-foreground-muted flex items-center justify-center rounded-md'>
        <IconPhoto aria-hidden className='size-6' />
      </span>
    ),
  },
};

/** A long title wraps beside the actions rather than being cut. */
export const LongTitle: Story = {
  args: {
    title:
      'Quarterly review of every supplier contract that renews before the end of the year',
    actions: <Button>Export</Button>,
  },
};

const LONG_DESCRIPTION =
  'Jobs submitted by applications, with their state, their owner and when each was last run';

/**
 * Actions that crowd the title's column: the description stays on one line, cut with an ellipsis.
 * No hover tooltip holds the rest, since nothing is available on hover only; the description is
 * one short phrase, and instructions belong in the page's help.
 */
export const LongDescription: Story = {
  args: {
    title: 'Jobs',
    description: LONG_DESCRIPTION,
    actions: (
      <>
        <Button>Filter</Button>
        <Button>Export</Button>
      </>
    ),
  },
  decorators: [
    (Story) => (
      <div className='max-w-sm'>
        <Story />
      </div>
    ),
  ],
  play: async ({ canvas }) => {
    const description = canvas.getByText(LONG_DESCRIPTION);
    const style = getComputedStyle(description);
    // One line: no taller than its line, and its text runs past its width.
    await expect(
      description.getBoundingClientRect().height,
    ).toBeLessThanOrEqual(Number.parseFloat(style.lineHeight) + 1);
    await expect(description.scrollWidth).toBeGreaterThan(
      description.clientWidth,
    );
    await expect(style.textOverflow).toBe('ellipsis');
    await expect(description).not.toHaveAttribute('title');
  },
};
