import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import type { Selection } from 'react-aria-components';

import { Button } from './button.tsx';
import {
  type DropdownMenuProps,
  Menu,
  MenuItem,
  MenuSeparator,
  MenuTrigger,
  Submenu,
  SubmenuTrigger,
} from './menu.tsx';

const meta = {
  title: 'Aria/Menu',
  component: Menu,
  args: { 'aria-label': 'Project actions' },
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Menu>;

export default meta;
type Story = StoryObj<typeof meta>;

type DemoProps = DropdownMenuProps<object>;

const ActionMenu = (args: DemoProps) => {
  const [chosen, setChosen] = useState<string>();
  return (
    <div className='flex flex-col items-center gap-3'>
      <MenuTrigger>
        <Button>Actions</Button>
        <Menu {...args} onAction={(key) => setChosen(String(key))}>
          <MenuItem id='rename'>Rename</MenuItem>
          <MenuItem id='duplicate'>Duplicate</MenuItem>
          <MenuItem id='share'>Share</MenuItem>
        </Menu>
      </MenuTrigger>
      <p className='text-canvas-foreground-muted text-sm'>
        Chosen: {chosen ?? 'nothing yet'}
      </p>
    </div>
  );
};

const SortMenu = (args: DemoProps) => {
  const [selected, setSelected] = useState<Selection>(() => new Set(['name']));
  return (
    <MenuTrigger>
      <Button>Sort by</Button>
      <Menu
        {...args}
        selectionMode='single'
        selectedKeys={selected}
        onSelectionChange={setSelected}
      >
        <MenuItem id='name'>Name</MenuItem>
        <MenuItem id='modified'>Last modified</MenuItem>
        <MenuItem id='size'>Size</MenuItem>
      </Menu>
    </MenuTrigger>
  );
};

const ColumnsMenu = (args: DemoProps) => {
  const [selected, setSelected] = useState<Selection>(
    () => new Set(['name', 'size']),
  );
  return (
    <MenuTrigger>
      <Button>Columns</Button>
      <Menu
        {...args}
        selectionMode='multiple'
        selectedKeys={selected}
        onSelectionChange={setSelected}
      >
        <MenuItem id='name'>Name</MenuItem>
        <MenuItem id='owner'>Owner</MenuItem>
        <MenuItem id='modified'>Last modified</MenuItem>
        <MenuItem id='size'>Size</MenuItem>
      </Menu>
    </MenuTrigger>
  );
};

/** Press the trigger to open the menu; the chosen item shows under it. */
export const Default: Story = {
  render: (args) => <ActionMenu {...args} />,
};

/** `placement` moves the menu; here it opens above its trigger, aligned to its start edge. */
export const PlacementTopStart: Story = {
  args: { placement: 'top start' },
  render: (args) => <ActionMenu {...args} />,
};

/** Groups set apart by a separator, a destructive item last, and a disabled item. */
export const GroupsAndDestructive: Story = {
  render: (args) => (
    <MenuTrigger>
      <Button>Actions</Button>
      <Menu {...args} disabledKeys={['archive']}>
        <MenuItem id='rename'>Rename</MenuItem>
        <MenuItem id='duplicate'>Duplicate</MenuItem>
        <MenuItem id='archive'>Archive</MenuItem>
        <MenuSeparator />
        <MenuItem id='delete' isDestructive>
          Delete
        </MenuItem>
      </Menu>
    </MenuTrigger>
  ),
};

/** A single-selection menu: the selected item carries a check mark, and every label stays aligned. */
export const SingleSelection: Story = {
  args: { 'aria-label': 'Sort by' },
  render: (args) => <SortMenu {...args} />,
};

export const MultipleSelection: Story = {
  args: { 'aria-label': 'Columns' },
  render: (args) => <ColumnsMenu {...args} />,
};

/** An item that opens a further menu ends with a chevron. */
export const WithSubmenu: Story = {
  render: (args) => (
    <MenuTrigger>
      <Button>Actions</Button>
      <Menu {...args}>
        <MenuItem id='rename'>Rename</MenuItem>
        <SubmenuTrigger>
          <MenuItem id='move'>Move to</MenuItem>
          <Submenu aria-label='Folders'>
            <MenuItem id='drafts'>Drafts</MenuItem>
            <MenuItem id='published'>Published</MenuItem>
            <MenuItem id='archive'>Archive</MenuItem>
          </Submenu>
        </SubmenuTrigger>
        <MenuSeparator />
        <MenuItem id='delete' isDestructive>
          Delete
        </MenuItem>
      </Menu>
    </MenuTrigger>
  ),
};
