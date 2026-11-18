import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, within } from 'storybook/test';

import {
  contrastRatio,
  NON_TEXT_CONTRAST,
} from '../../internal/contrast.testing.ts';
import { startEdgeOf, TRANSPARENT } from '../../internal/itemstate.testing.ts';
import { Button } from '../button/index.ts';
import { useFileDrop } from '../draganddrop/index.ts';
import {
  GridList,
  GridListItem,
  GridListLoadMore,
  type GridListProps,
  GridListSection,
  GridListTile,
} from './index.ts';

type Doc = {
  id: string;
  name: string;
  kind: string;
  size: string;
  modified: string;
};

const docs: Doc[] = [
  {
    id: 'brief',
    name: 'Launch brief.pdf',
    kind: 'PDF',
    size: '1.2 MB',
    modified: 'Nov 14',
  },
  {
    id: 'budget',
    name: 'Budget 2027.xlsx',
    kind: 'Spreadsheet',
    size: '86 KB',
    modified: 'Nov 12',
  },
  {
    id: 'logo',
    name: 'Logo.svg',
    kind: 'Image',
    size: '14 KB',
    modified: 'Nov 3',
  },
];

const meta = {
  title: 'Aria/GridList',
  component: GridList,
  args: {
    'aria-label': 'Files',
    emptyState: {
      title: 'No files yet',
      description: 'Files added to the project appear here.',
    },
  },
} satisfies Meta<typeof GridList>;

export default meta;
type Story = StoryObj<typeof meta>;

type ListArgs = GridListProps<object>;

/** The documents as plain items, one line of text each. */
const docItems = (rows: readonly Doc[]) =>
  rows.map((doc) => (
    <GridListItem key={doc.id} id={doc.id}>
      {doc.name}
    </GridListItem>
  ));

const errorNotice = (
  <p
    role='alert'
    className='bg-surface border-error text-error rounded-lg border p-3 text-sm'
  >
    The files could not be read. Check your connection and try again.
  </p>
);

/** Plain items with text only. */
export const SimpleItems: Story = {
  render: (args) => (
    <GridList {...args}>
      <GridListItem id='a'>Launch brief.pdf</GridListItem>
      <GridListItem id='b'>Budget 2027.xlsx</GridListItem>
      <GridListItem id='c'>Logo.svg</GridListItem>
    </GridList>
  ),
};

/**
 * Rows that select, replacing the selection on a press. A selected row has its tint and, so that
 * color is not the only sign, a 2px primary bar at its start edge; an unselected row keeps the same
 * edge, transparent, so selecting never moves a row's content.
 */
export const SelectedRows: Story = {
  render: (args) => (
    <GridList
      {...args}
      selectionMode='multiple'
      selectionBehavior='replace'
      defaultSelectedKeys={['budget']}
    >
      {docItems(docs)}
    </GridList>
  ),
  play: async ({ canvas, userEvent }) => {
    const row = (name: string) => canvas.getByRole('row', { name });
    const surface = getComputedStyle(canvas.getByRole('grid')).backgroundColor;
    const selected = startEdgeOf(row('Budget 2027.xlsx'));
    await expect(selected.width).toBe('2px');
    await expect(contrastRatio(selected.color, surface)).toBeGreaterThanOrEqual(
      NON_TEXT_CONTRAST,
    );
    await expect(startEdgeOf(row('Launch brief.pdf'))).toEqual({
      width: '2px',
      color: TRANSPARENT,
    });

    // The bar follows the selection, and the row's content stays where it was.
    const text = within(row('Launch brief.pdf')).getByText('Launch brief.pdf');
    const left = text.getBoundingClientRect().left;
    await userEvent.click(row('Launch brief.pdf'));
    await expect(startEdgeOf(row('Launch brief.pdf')).color).toBe(
      selected.color,
    );
    await expect(startEdgeOf(row('Budget 2027.xlsx')).color).toBe(TRANSPARENT);
    await expect(text.getBoundingClientRect().left).toBe(left);
  },
};

/** `layout='grid'` with tiles; the caller sets the grid's columns. */
export const Tiles: Story = {
  render: (args) => (
    <GridList
      {...args}
      layout='grid'
      selectionMode='multiple'
      defaultSelectedKeys={['budget']}
      className='grid grid-cols-3 gap-3 p-3'
    >
      {docs.map((doc) => (
        <GridListTile key={doc.id} id={doc.id} textValue={doc.name}>
          <div className='bg-neutral h-20 rounded-md' />
          <span className='truncate font-medium'>{doc.name}</span>
          <span className='text-surface-foreground-muted text-xs'>
            {doc.size}
          </span>
        </GridListTile>
      ))}
    </GridList>
  ),
};

/** Titled groups of rows, with a count in each title. */
export const Sections: Story = {
  render: (args) => (
    <GridList {...args}>
      <GridListSection id='recent' title='Recent' count='(2)'>
        {docItems(docs.slice(0, 2))}
      </GridListSection>
      <GridListSection id='older' title='Older' count='(1)'>
        {docItems(docs.slice(2))}
      </GridListSection>
    </GridList>
  ),
};

/** The end of a paged list while the next page is read. */
export const LoadingMore: Story = {
  render: (args) => (
    <GridList {...args}>
      {docItems(docs)}
      <GridListLoadMore
        isLoading
        pendingText='Loading more files'
        onLoadMore={() => undefined}
      />
    </GridList>
  ),
};

/** The read succeeded with no items: the empty state, with an action. */
export const Empty: Story = {
  args: {
    emptyState: {
      title: 'No files yet',
      description: 'Files added to the project appear here.',
      actions: (
        <Button variant='solid' tone='primary'>
          Add files
        </Button>
      ),
    },
  },
  render: (args) => <GridList {...args}>{[]}</GridList>,
};

/** The first read is on its way. */
export const Pending: Story = {
  render: (args) => (
    <GridList {...args} isPending pendingText='Loading files'>
      {[]}
    </GridList>
  ),
};

/** The first read failed: the app's notice above, and an empty body that claims nothing. */
export const Failed: Story = {
  render: (args) => (
    <GridList {...args} error={errorNotice}>
      {[]}
    </GridList>
  ),
};

/** A refresh failed: the notice above, and the items already read stay usable. */
export const RefreshFailed: Story = {
  render: (args) => (
    <GridList {...args} error={errorNotice}>
      {docItems(docs)}
    </GridList>
  ),
};

const FileDropList = ({
  isDropDisabled = false,
  ...args
}: ListArgs & { isDropDisabled?: boolean }) => {
  const [added, setAdded] = useState<string[]>([]);
  const [failure, setFailure] = useState<string>();
  const fileDrop = useFileDrop({
    isDisabled: isDropDisabled,
    onFiles: (files) => {
      setFailure(undefined);
      setAdded((names) => [...names, ...files.map((file) => file.name)]);
    },
    onDropError: setFailure,
  });
  return (
    <div className='flex flex-col gap-3'>
      <GridList
        aria-label={args['aria-label']}
        emptyState={args.emptyState}
        fileDrop={fileDrop}
      >
        {added.map((name) => (
          <GridListItem key={name} id={name}>
            {name}
          </GridListItem>
        ))}
      </GridList>
      {failure && (
        <p role='alert' className='text-error text-sm'>
          The drop gave no files: {failure}
        </p>
      )}
    </div>
  );
};

/** Drop files from the desktop onto the list: its dashed frame says it takes files. */
export const FileDrop: Story = {
  args: {
    emptyState: {
      title: 'Drop files here',
      description: 'They are added to the project.',
    },
  },
  render: (args) => <FileDropList {...args} />,
};

/** The list keeps its drop while disabled, with a solid frame, and refuses files. */
export const FileDropDisabled: Story = {
  ...FileDrop,
  render: (args) => <FileDropList {...args} isDropDisabled />,
};
