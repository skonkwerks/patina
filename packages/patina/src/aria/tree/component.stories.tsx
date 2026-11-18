import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Collection, type Key } from 'react-aria-components';
import { expect, waitFor, within } from 'storybook/test';

import {
  contrastRatio,
  NON_TEXT_CONTRAST,
} from '../../internal/contrast.testing.ts';
import { startEdgeOf, TRANSPARENT } from '../../internal/itemstate.testing.ts';
import { pressTab } from '../../internal/keyboard.testing.ts';
import { Button } from '../button/index.ts';
import { Tree, TreeItem, type TreeProps } from './index.ts';

const meta = {
  title: 'Aria/Tree',
  component: Tree,
  args: { 'aria-label': 'Files', defaultExpandedKeys: ['documents'] },
} satisfies Meta<typeof Tree>;

export default meta;
type Story = StoryObj<typeof meta>;

const Files = (args: TreeProps<object>) => (
  <Tree {...args} className='w-72'>
    <TreeItem id='documents' title='Documents'>
      <TreeItem id='project' title='Project'>
        <TreeItem id='report' title='Weekly report' />
        <TreeItem id='budget' title='Budget' />
      </TreeItem>
      <TreeItem id='letter' title='Cover letter' />
    </TreeItem>
    <TreeItem id='photos' title='Photos'>
      <TreeItem id='beach' title='Beach' />
      <TreeItem id='mountains' title='Mountains' />
    </TreeItem>
    <TreeItem id='notes' title='Notes' />
  </Tree>
);

/**
 * React Aria renders a tree's rows after its own first render, and in Storybook's page a play can
 * start in between: a Tab then focuses the empty tree, which keeps the focus. A play waits for the
 * rows before it acts.
 */
const rowsRendered = (canvas: {
  findByRole: (role: 'row', options: { name: string }) => Promise<HTMLElement>;
}) => canvas.findByRole('row', { name: 'Documents' });

/** The drawn mark of a row's selection checkbox: the label's last child, after the hidden input. */
const markOf = (checkbox: HTMLElement) =>
  checkbox.closest('label')?.querySelector(':scope > span:last-child');

/**
 * Rows open and close. Tab enters the tree; Up and Down move between visible rows; Right opens a
 * closed row; Left closes an open row, or moves to the parent of a closed one; Home and End reach
 * the first and last rows; typing a title's first letters moves to it. With nothing to select and
 * no actions, Enter opens and closes the focused row. Each level is indented one chevron's width
 * further.
 */
export const Default: Story = {
  render: (args) => <Files {...args} />,
  play: async ({ canvas, userEvent }) => {
    const row = (name: string) => canvas.getByRole('row', { name });
    await rowsRendered(canvas);
    const title = (name: string) =>
      within(row(name)).getByText(name).getBoundingClientRect().left;

    await userEvent.tab();
    await expect(row('Documents')).toHaveFocus();
    await expect(row('Documents')).toHaveAttribute('aria-expanded', 'true');

    await userEvent.keyboard('{ArrowDown}');
    await expect(row('Project')).toHaveFocus();
    await expect(row('Project')).toHaveAttribute('aria-expanded', 'false');
    await expect(title('Project') - title('Documents')).toBe(20);

    await userEvent.keyboard('{ArrowRight}');
    await expect(row('Project')).toHaveAttribute('aria-expanded', 'true');
    await expect(row('Project')).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    await expect(row('Weekly report')).toHaveFocus();
    await expect(title('Weekly report') - title('Project')).toBe(20);

    // Left from a row with no children moves to its parent; Left again closes the parent.
    await userEvent.keyboard('{ArrowLeft}');
    await expect(row('Project')).toHaveFocus();
    await userEvent.keyboard('{ArrowLeft}');
    await expect(row('Project')).toHaveAttribute('aria-expanded', 'false');
    await expect(canvas.queryByRole('row', { name: 'Weekly report' })).toBe(
      null,
    );
    await userEvent.keyboard('{Enter}');
    await expect(row('Project')).toHaveAttribute('aria-expanded', 'true');

    await userEvent.keyboard('{End}');
    await expect(row('Notes')).toHaveFocus();
    await userEvent.keyboard('{Home}');
    await expect(row('Documents')).toHaveFocus();
    await userEvent.keyboard('ph');
    await expect(row('Photos')).toHaveFocus();
  },
};

/**
 * Multiple selection that toggles (React Aria's default): each row leads with its checkbox. Tab
 * enters at the selected row; Space selects the focused row; a press on a row or its checkbox
 * selects it, and again clears it.
 */
export const MultipleSelection: Story = {
  args: {
    selectionMode: 'multiple',
    defaultSelectedKeys: ['letter'],
    defaultExpandedKeys: ['documents', 'project'],
  },
  render: (args) => <Files {...args} />,
  play: async ({ canvas, userEvent }) => {
    const row = (name: string) => canvas.getByRole('row', { name });
    await rowsRendered(canvas);
    await expect(row('Cover letter')).toHaveAttribute('aria-selected', 'true');
    await expect(
      within(row('Cover letter')).getByRole('checkbox'),
    ).toBeChecked();
    // The tree's checkbox is the shared mark (`checkMarkStyles`), whose `control-border` edge the
    // contract story "Control edges" holds to 3:1 through `Checkbox` on every layer and hover fill,
    // in both modes. This keeps the tree on that mark: its unchecked edge is the token, at 3:1
    // against the tree's surface.
    const unchecked = markOf(within(row('Budget')).getByRole('checkbox'));
    await expect(unchecked?.className).toContain('border-control-border');
    await expect(
      unchecked &&
        contrastRatio(
          getComputedStyle(unchecked).borderTopColor,
          getComputedStyle(canvas.getByRole('treegrid')).backgroundColor,
        ),
    ).toBeGreaterThanOrEqual(NON_TEXT_CONTRAST);

    // The tree is entered at its selected row.
    await userEvent.tab();
    await expect(row('Cover letter')).toHaveFocus();
    await userEvent.keyboard('{ArrowUp}{ArrowUp}');
    await expect(row('Weekly report')).toHaveFocus();
    await userEvent.keyboard(' ');
    await expect(row('Weekly report')).toHaveAttribute('aria-selected', 'true');
    await expect(row('Cover letter')).toHaveAttribute('aria-selected', 'true');

    // Right on a row with no children moves into its checkbox, which then shows the focus ring;
    // Space on it clears the row's selection.
    const checkbox = within(row('Weekly report')).getByRole('checkbox');
    await userEvent.keyboard('{ArrowRight}');
    await expect(checkbox).toHaveFocus();
    const mark = markOf(checkbox);
    await expect(mark && getComputedStyle(mark).outlineWidth).toBe('2px');
    await userEvent.keyboard(' ');
    await expect(row('Weekly report')).toHaveAttribute(
      'aria-selected',
      'false',
    );
    await userEvent.keyboard('{ArrowLeft}');
    await expect(row('Weekly report')).toHaveFocus();

    await userEvent.click(within(row('Notes')).getByRole('checkbox'));
    await expect(row('Notes')).toHaveAttribute('aria-selected', 'true');
    await userEvent.click(within(row('Notes')).getByRole('checkbox'));
    await expect(row('Notes')).toHaveAttribute('aria-selected', 'false');
  },
};

/**
 * Selection that replaces, as in a list of files: no checkboxes; a press selects that row alone, and
 * Shift with an arrow key extends the selection. A selected row has its tint and a bar at its start
 * edge.
 */
export const ReplaceSelection: Story = {
  args: {
    selectionMode: 'multiple',
    selectionBehavior: 'replace',
    defaultExpandedKeys: ['documents', 'photos'],
  },
  render: (args) => <Files {...args} />,
  play: async ({ canvas, userEvent }) => {
    const row = (name: string) => canvas.getByRole('row', { name });
    await rowsRendered(canvas);
    await expect(canvas.queryAllByRole('checkbox')).toHaveLength(0);

    await userEvent.click(row('Beach'));
    await expect(row('Beach')).toHaveAttribute('aria-selected', 'true');
    await userEvent.click(row('Cover letter'));
    await expect(row('Cover letter')).toHaveAttribute('aria-selected', 'true');
    await expect(row('Beach')).toHaveAttribute('aria-selected', 'false');

    // With no checkbox, a selected row shows it by more than its tint: a 2px primary bar at its
    // start edge, at 3:1 against the surface; an unselected row's edge is transparent.
    const selected = startEdgeOf(row('Cover letter'));
    await expect(selected.width).toBe('2px');
    await expect(
      contrastRatio(
        selected.color,
        getComputedStyle(canvas.getByRole('treegrid')).backgroundColor,
      ),
    ).toBeGreaterThanOrEqual(NON_TEXT_CONTRAST);
    await expect(startEdgeOf(row('Beach'))).toEqual({
      width: '2px',
      color: TRANSPARENT,
    });

    await userEvent.keyboard('{Shift>}{ArrowDown}{/Shift}');
    await expect(row('Photos')).toHaveFocus();
    await expect(row('Photos')).toHaveAttribute('aria-selected', 'true');
    await expect(row('Cover letter')).toHaveAttribute('aria-selected', 'true');
  },
};

/** A disabled row is faded and skipped by the arrow keys. */
export const DisabledItems: Story = {
  args: { disabledKeys: ['photos'], defaultExpandedKeys: [] },
  render: (args) => <Files {...args} />,
  play: async ({ canvas, userEvent }) => {
    const row = (name: string) => canvas.getByRole('row', { name });
    await rowsRendered(canvas);
    await expect(row('Photos')).toHaveAttribute('aria-disabled', 'true');
    await userEvent.tab();
    await expect(row('Documents')).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    await expect(row('Notes')).toHaveFocus();
  },
};

/**
 * The tree is one Tab stop, its selection checkboxes included: Tab leaves it for the next control,
 * and Shift+Tab comes back to the row it left from.
 */
export const OneTabStop: Story = {
  args: { selectionMode: 'multiple' },
  render: (args) => (
    <div className='flex flex-col items-start gap-3'>
      <Button>Before</Button>
      <Files {...args} />
      <Button>After</Button>
    </div>
  ),
  play: async ({ canvas, canvasElement, userEvent }) => {
    const document = canvasElement.ownerDocument;
    const row = (name: string) => canvas.getByRole('row', { name });
    await rowsRendered(canvas);

    pressTab(document);
    await expect(canvas.getByRole('button', { name: 'Before' })).toHaveFocus();
    pressTab(document);
    await waitFor(() => expect(row('Documents')).toHaveFocus());
    await userEvent.keyboard('{ArrowDown}');
    await expect(row('Project')).toHaveFocus();

    pressTab(document);
    await expect(canvas.getByRole('button', { name: 'After' })).toHaveFocus();
    pressTab(document, { isShift: true });
    await waitFor(() => expect(row('Project')).toHaveFocus());
  },
};

/** Rows with an action: Enter, or a press, opens the row. A row's action is separate from opening its children. */
export const WithActions: Story = {
  render: function Render(args) {
    const [opened, setOpened] = useState<Key | null>(null);
    return (
      <div className='flex flex-col gap-2'>
        <Files {...args} onAction={setOpened} />
        <p role='status' className='text-canvas-foreground-muted text-xs'>
          {opened === null ? 'Nothing opened' : `Opened ${String(opened)}`}
        </p>
      </div>
    );
  },
  play: async ({ canvas, userEvent }) => {
    await rowsRendered(canvas);
    await userEvent.tab();
    await userEvent.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}{Enter}');
    await expect(canvas.getByRole('status')).toHaveTextContent('Opened photos');
    await userEvent.click(canvas.getByRole('row', { name: 'Notes' }));
    await expect(canvas.getByRole('status')).toHaveTextContent('Opened notes');
  },
};

type Folder = { id: string; title: string; children: Folder[] };

const folders: Folder[] = [
  {
    id: 'src',
    title: 'src',
    children: [
      {
        id: 'components',
        title: 'components',
        children: [
          { id: 'button', title: 'button.tsx', children: [] },
          { id: 'dialog', title: 'dialog.tsx', children: [] },
        ],
      },
      { id: 'main', title: 'main.tsx', children: [] },
    ],
  },
  { id: 'readme', title: 'README.md', children: [] },
];

const FolderItem = ({ folder }: { folder: Folder }) => (
  <TreeItem id={folder.id} title={folder.title}>
    <Collection items={folder.children}>
      {(child) => <FolderItem folder={child} />}
    </Collection>
  </TreeItem>
);

/** Rows from data: `items` on the tree, and a `Collection` of each row's children. The open rows are controlled. */
export const Dynamic: Story = {
  render: function Render(args) {
    const [expanded, setExpanded] = useState<Set<Key>>(() => new Set(['src']));
    return (
      <div className='flex flex-col gap-2'>
        <Tree
          {...args}
          aria-label='Project files'
          items={folders}
          expandedKeys={expanded}
          onExpandedChange={setExpanded}
          className='w-72'
        >
          {(folder) => <FolderItem folder={folder} />}
        </Tree>
        <p className='text-canvas-foreground-muted text-xs'>
          Open: {[...expanded].join(', ') || 'none'}
        </p>
      </div>
    );
  },
};
