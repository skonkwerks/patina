import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { Switch } from './switch.tsx';

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
