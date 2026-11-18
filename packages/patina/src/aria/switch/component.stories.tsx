import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { Switch } from './index.js';

const meta = {
  title: 'Aria/Switch',
  component: Switch,
  args: { children: 'Dark mode' },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Off: Story = {};

export const On: Story = { args: { defaultSelected: true } };

/** A description under the label, indented to line up with it. */
export const WithDescription: Story = {
  args: { description: 'Takes effect right away on this device.' },
};

export const Disabled: Story = { args: { isDisabled: true } };

export const DisabledOn: Story = {
  args: { isDisabled: true, defaultSelected: true },
};

export const ReadOnly: Story = {
  args: { isReadOnly: true, defaultSelected: true },
};

export const Controlled: Story = {
  render: function Render(args) {
    const [on, setOn] = useState(false);
    return (
      <div className='flex flex-col gap-2'>
        <Switch {...args} isSelected={on} onChange={setOn} />
        <p className='text-surface-foreground-muted text-xs'>
          {on ? 'On' : 'Off'}
        </p>
      </div>
    );
  },
};

/**
 * While its write is on its way: the spinner in the thumb, read-only, the focus kept, and the
 * pending text in place of the description, so it is said in words.
 */
export const Pending: Story = {
  args: {
    isPending: true,
    pendingText: 'Saving',
    defaultSelected: true,
    description: 'Use the dark theme on this device.',
  },
};

/**
 * Pending without a description, as a switch in a row usually is: the pending text is said to
 * assistive technology but not shown, so the switch keeps its height while it saves.
 */
export const PendingWithoutDescription: Story = {
  args: {
    isPending: true,
    pendingText: 'Saving',
    defaultSelected: true,
  },
};
