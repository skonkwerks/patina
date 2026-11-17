import type { Meta, StoryObj } from '@storybook/react-vite';
import { IconDownload, IconInfoCircle } from '@tabler/icons-react';
import { useState } from 'react';
import type { Selection } from 'react-aria-components';

import {
  GridList,
  GridListLoadMore,
  type GridListProps,
  GridListSection,
} from '../../aria/gridlist/index.ts';
import { MenuItem, MenuSeparator } from '../../aria/menu/index.ts';
import { RowTile } from '../../rowtile/index.ts';
import { ActionMenu } from '../actionmenu/index.ts';
import { GridListRow } from './index.ts';

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
  title: 'Composites/GridListRow',
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

/** Rows in the one row layout: media, title, metadata, an end value and the action menu. */
export const Rows: Story = {
  render: (args) => <GridList {...args}>{docRows(docs)}</GridList>,
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

/** Rows grouped under section headers, each header naming its count. */
export const InSections: Story = {
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

/** Rows at the end of a paged list while the next page is read. */
export const BeforeLoadingMore: Story = {
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

const errorNotice = (
  <p
    role='alert'
    className='bg-surface border-destructive text-destructive rounded-lg border p-3 text-sm'
  >
    The files could not be refreshed. Check your connection and try again.
  </p>
);

/** A refresh failed: the notice stands above the rows already read, which stay on screen. */
export const UnderRefreshFailure: Story = {
  render: (args) => (
    <GridList {...args} error={errorNotice}>
      {docRows(docs)}
    </GridList>
  ),
};
