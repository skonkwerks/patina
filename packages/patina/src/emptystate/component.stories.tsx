import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from '../aria/button/index.ts';
import { EmptyState } from './index.ts';

const meta = {
  title: 'Core/EmptyState',
  component: EmptyState,
  args: { title: 'No projects yet' },
  decorators: [
    // The empty state draws no frame; the collection around it does.
    (Story) => (
      <div className='bg-surface border-surface-border w-96 rounded-lg border'>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TitleOnly: Story = {};

export const WithDescription: Story = {
  args: { description: 'Projects you create or join will appear here.' },
};

export const WithAction: Story = {
  args: {
    description: 'Projects you create or join will appear here.',
    actions: (
      <Button variant='solid' tone='primary'>
        Create project
      </Button>
    ),
  },
};
