import type { Meta, StoryObj } from '@storybook/react-vite';
import { IconPhoto } from '@tabler/icons-react';

import { Button } from '../aria/button/index.ts';
import { Chip } from '../chip/index.ts';
import { InfoButton } from '../composites/infobutton/index.ts';
import { Header } from './index.ts';

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
