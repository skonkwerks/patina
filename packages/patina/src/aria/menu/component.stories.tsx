import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import type { Selection } from 'react-aria-components';
import { expect, waitFor, within } from 'storybook/test';

import { ActionMenu } from '../../composites/actionmenu/index.js';
import { Button } from '../button/index.js';
import {
  Menu,
  MenuItem,
  type MenuProps,
  MenuSeparator,
  MenuTrigger,
  Submenu,
  SubmenuTrigger,
} from './index.js';

const meta = {
  title: 'Aria/Menu',
  component: Menu,
  args: { 'aria-label': 'Project actions' },
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Menu>;

export default meta;
type Story = StoryObj<typeof meta>;

type DemoProps = MenuProps<object>;

const ProjectActions = (args: DemoProps) => {
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

const fileActions = [
  { id: 'rename', name: 'Rename' },
  { id: 'duplicate', name: 'Duplicate' },
  { id: 'share', name: 'Share' },
];

/**
 * A file whose press opens it, with its actions in the row's `ActionMenu` and, as a shortcut, in its
 * context menu: `MenuTrigger` with `trigger='contextMenu'`. The context menu is never an action's
 * only home.
 */
const FileWithContextMenu = (args: DemoProps) => {
  const [chosen, setChosen] = useState<string>();
  const items = fileActions.map((action) => (
    <MenuItem key={action.id} id={action.id}>
      {action.name}
    </MenuItem>
  ));
  return (
    <div className='flex flex-col items-center gap-3'>
      <div className='flex items-center gap-2'>
        <MenuTrigger trigger='contextMenu'>
          <Button
            variant='outline'
            className='h-24 w-64'
            onPress={() => {
              setChosen('open');
            }}
          >
            Quarterly report.pdf
          </Button>
          <Menu {...args} onAction={(key) => setChosen(String(key))}>
            {items}
          </Menu>
        </MenuTrigger>
        <ActionMenu
          aria-label='Actions for Quarterly report.pdf'
          onAction={(key) => setChosen(String(key))}
        >
          {items}
        </ActionMenu>
      </div>
      <p className='text-canvas-foreground-muted text-sm'>
        Chosen: {chosen ?? 'nothing yet'}
      </p>
    </div>
  );
};

/** Press the trigger to open the menu; the chosen item shows under it. */
export const Default: Story = {
  render: (args) => <ProjectActions {...args} />,
};

/** `placement` moves the menu; here it opens above its trigger, aligned to its start edge. */
export const PlacementTopStart: Story = {
  args: { placement: 'top start' },
  render: (args) => <ProjectActions {...args} />,
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

/**
 * A context menu (`MenuTrigger` with `trigger='contextMenu'`): a right click, Control and a click on
 * a Mac, or a long press on a touch screen opens the menu where the pointer was, in place of the
 * browser's own; the keyboard's command (Shift+F10, or Control+Enter on a Mac) opens it on the
 * control. A press still does the control's own action, and the trigger does not announce a menu,
 * since its press does not open one. The same actions stand in the row's `ActionMenu`.
 */
export const ContextMenu: Story = {
  render: (args) => <FileWithContextMenu {...args} />,
  play: async ({ canvas, canvasElement, userEvent }) => {
    const page = within(canvasElement.ownerDocument.body);
    const file = canvas.getByRole('button', { name: 'Quarterly report.pdf' });
    await expect(file).not.toHaveAttribute('aria-haspopup');

    const box = file.getBoundingClientRect();
    const point = { clientX: box.left + 40, clientY: box.top + 30 };
    await userEvent.pointer({
      keys: '[MouseRight]',
      target: file,
      coords: point,
    });
    // React Aria names the menu after what it was opened on.
    const menu = await page.findByRole('menu', {
      name: 'Quarterly report.pdf',
    });

    // The menu opens at the pointer: its popover's top start corner is where the click was.
    const popover = menu.closest<HTMLElement>('[data-trigger]');
    await expect(popover).not.toBeNull();
    await waitFor(async () => {
      const opened = popover?.getBoundingClientRect();
      await expect(Math.round(opened?.left ?? 0)).toBe(
        Math.round(point.clientX),
      );
      await expect(Math.round(opened?.top ?? 0)).toBe(
        Math.round(point.clientY),
      );
    });

    await userEvent.click(
      within(menu).getByRole('menuitem', { name: 'Rename' }),
    );
    await waitFor(async () => {
      await expect(page.queryByRole('menu')).not.toBeInTheDocument();
    });
    await expect(canvas.getByText('Chosen: rename')).toBeInTheDocument();

    // A press is the file's own action, not the menu.
    await userEvent.click(file);
    await expect(canvas.getByText('Chosen: open')).toBeInTheDocument();
    await expect(page.queryByRole('menu')).not.toBeInTheDocument();
  },
};
