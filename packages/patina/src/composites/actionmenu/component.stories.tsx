import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { MenuItem, MenuSeparator } from '../../aria/menu/index.ts';
import { ActionMenu, type ActionMenuProps } from './index.ts';

const items = (
  <>
    <MenuItem id='rename'>Rename</MenuItem>
    <MenuItem id='duplicate'>Duplicate</MenuItem>
    <MenuSeparator />
    <MenuItem id='delete' isDestructive>
      Delete
    </MenuItem>
  </>
);

const meta = {
  title: 'Composites/ActionMenu',
  component: ActionMenu,
  args: {
    'aria-label': 'Actions for Invoice 1042',
    onAction: () => undefined,
    children: items,
  },
  parameters: { layout: 'centered' },
} satisfies Meta<typeof ActionMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

const ActionMenuWithChoice = (args: ActionMenuProps) => {
  const [chosen, setChosen] = useState<string>();
  return (
    <div className='flex items-center gap-3'>
      <ActionMenu {...args} onAction={(key) => setChosen(String(key))} />
      <span className='text-canvas-foreground-muted text-sm'>
        Chosen: {chosen ?? 'nothing yet'}
      </span>
    </div>
  );
};

/** The vertical dots and the menu they open; the chosen item shows beside them. */
export const Default: Story = {
  render: (args) => <ActionMenuWithChoice {...args} />,
};

/** A write started from the menu is running: a spinner replaces the dots and the menu does not open. */
export const Pending: Story = { args: { isPending: true } };

export const Disabled: Story = { args: { isDisabled: true } };
