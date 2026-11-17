import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { SearchField } from './index.ts';

const meta = {
  title: 'Aria/SearchField',
  component: SearchField,
  args: { label: 'Search', placeholder: 'Search projects' },
} satisfies Meta<typeof SearchField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** With text, the clear control shows; Escape clears too. */
export const WithValue: Story = { args: { defaultValue: 'aria' } };

/** No visible label, as in a toolbar: the field carries `aria-label`. */
export const WithoutVisibleLabel: Story = {
  args: { label: undefined, 'aria-label': 'Search projects' },
};

export const Disabled: Story = {
  args: { isDisabled: true, defaultValue: 'aria' },
};

/** Enter calls `onSubmit`; by default Enter does nothing. */
export const WithSubmit: Story = {
  render: function Render(args) {
    const [submitted, setSubmitted] = useState<string | null>(null);
    return (
      <div className='flex flex-col gap-2'>
        <SearchField {...args} onSubmit={setSubmitted} />
        <p className='text-surface-foreground-muted text-xs'>
          {submitted === null
            ? 'Press Enter to search.'
            : `Searched for “${submitted}”`}
        </p>
      </div>
    );
  },
};
