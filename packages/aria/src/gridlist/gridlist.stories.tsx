import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import type { Selection } from 'react-aria-components';

import { ActionMenu } from '../actionmenu.tsx';
import { Button } from '../button.tsx';
import { IconDownload, IconInfoCircle } from '../icons.tsx';
import { MenuItem, MenuSeparator } from '../menu.tsx';
import { useFileDrop } from '../usefiledrop.ts';
import { GridList, type GridListProps } from './component.tsx';
import { GridListItem } from './item.tsx';
import { GridListLoadMore } from './loadmore.tsx';
import { GridListRow } from './row.tsx';
import { RowTile } from './rowtile.tsx';
import { GridListSection } from './section.tsx';
import { GridListTile } from './tile.tsx';

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

const rowActions = (name: string) => (
  <ActionMenu aria-label={`Actions for ${name}`} onAction={() => undefined}>
    <MenuItem id='rename'>Rename</MenuItem>
    <MenuItem id='download'>Download</MenuItem>
    <MenuSeparator />
    <MenuItem id='delete' isDestructive>
      Delete
    </MenuItem>
  </ActionMenu>
);

const docRows = (rows: readonly Doc[]) =>
  rows.map((doc) => (
    <GridListRow
      key={doc.id}
      id={doc.id}
      title={doc.name}
      media={
        <RowTile kind='mark'>
          <IconDownload aria-hidden className='h-full w-full' />
        </RowTile>
      }
      metadata={[
        { id: 'kind', value: doc.kind },
        { id: 'modified', value: `Modified ${doc.modified}` },
      ]}
      endContent={doc.size}
      actions={rowActions(doc.name)}
    />
  ));

const errorNotice = (
  <p
    role='alert'
    className='bg-surface border-destructive text-destructive rounded-lg border p-3 text-sm'
  >
    The files could not be read. Check your connection and try again.
  </p>
);

/** Rows in the one row layout: media, title, metadata, an end value and the action menu. */
export const Rows: Story = {
  render: (args) => <GridList {...args}>{docRows(docs)}</GridList>,
};

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

/** Every part a row can have: badges, two metadata lines, a description, the open chevron and a child below. */
export const FullRow: Story = {
  render: (args) => (
    <GridList {...args}>
      <GridListRow
        id='brief'
        title='Launch brief.pdf'
        media={
          <RowTile kind='mark'>
            <IconInfoCircle aria-hidden className='h-full w-full' />
          </RowTile>
        }
        badges={
          <span className='bg-neutral text-neutral-foreground rounded px-1.5 py-0.5 text-xs'>
            Draft
          </span>
        }
        metadata={[
          { id: 'kind', value: 'PDF' },
          { id: 'pages', value: '12 pages' },
        ]}
        secondaryMetadata={[{ id: 'owner', value: 'Shared with Marketing' }]}
        description='The version sent to the agency on Friday.'
        endContent='1.2 MB'
        openAction={{
          label: 'Open Launch brief.pdf',
          onPress: () => undefined,
        }}
        actions={rowActions('Launch brief.pdf')}
      />
      <GridListRow
        id='budget'
        title='Budget 2027.xlsx'
        hasActionSpace
        endContent='86 KB'
        metadata={[{ id: 'kind', value: 'Spreadsheet' }]}
      >
        <p role='alert' className='text-destructive text-xs'>
          The last upload failed.
        </p>
      </GridListRow>
    </GridList>
  ),
};

const SelectableList = (args: ListArgs) => {
  const [selected, setSelected] = useState<Selection>(
    () => new Set(['budget']),
  );
  return (
    <GridList
      {...args}
      selectionMode='multiple'
      selectedKeys={selected}
      onSelectionChange={setSelected}
    >
      {docRows(docs)}
    </GridList>
  );
};

/** Selected rows take a light primary fill. */
export const Selectable: Story = {
  render: (args) => <SelectableList {...args} />,
};

export const DisabledItem: Story = {
  render: (args) => (
    <GridList {...args} selectionMode='single' disabledKeys={['logo']}>
      {docRows(docs)}
    </GridList>
  ),
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
        {docRows(docs.slice(0, 2))}
      </GridListSection>
      <GridListSection id='older' title='Older' count='(1)'>
        {docRows(docs.slice(2))}
      </GridListSection>
    </GridList>
  ),
};

/** The end of a paged list while the next page is read. */
export const LoadingMore: Story = {
  render: (args) => (
    <GridList {...args}>
      {docRows(docs)}
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
      {docRows(docs)}
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
        aria-label={args['aria-label'] ?? 'Files'}
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
        <p role='alert' className='text-destructive text-sm'>
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
