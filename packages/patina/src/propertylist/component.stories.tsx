import type { Meta, StoryObj } from '@storybook/react-vite';

import { Chip } from '../chip/index.js';
import { PropertyList } from './index.js';

const items = [
  { id: 'owner', label: 'Owner', value: 'Dana Reyes' },
  {
    id: 'status',
    label: 'Status',
    value: <Chip tone='success'>Published</Chip>,
  },
  { id: 'created', label: 'Created', value: 'March 4, 2026' },
  { id: 'description', label: 'Description', value: '' },
  {
    id: 'long',
    label: 'A label long enough to break onto a second line in its column',
    value: 'Its value stays on the first line beside it.',
  },
];

const meta = {
  title: 'Core/PropertyList',
  component: PropertyList,
  args: { items, emptyValue: 'None' },
  decorators: [
    (Story) => (
      <div className='max-w-xl'>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PropertyList>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Label beside value; an empty value shows `emptyValue`. */
export const Horizontal: Story = {};

/** Label above value, for a narrow detail panel. */
export const Stacked: Story = {
  args: { layout: 'stacked' },
  decorators: [
    (Story) => (
      <div className='w-72'>
        <Story />
      </div>
    ),
  ],
};
