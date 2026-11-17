import type { Meta, StoryObj } from '@storybook/react-vite';
import { type ReactNode, useState } from 'react';

import { Button } from './button.tsx';
import {
  Cell,
  Column,
  Row,
  Table,
  TableBody,
  TableHeader,
  TableLoadMore,
  type TableProps,
} from './table.tsx';

type Invoice = { id: string; customer: string; issued: string; amount: string };

const invoices: Invoice[] = [
  {
    id: '1042',
    customer: 'Northwind Traders',
    issued: 'Nov 2',
    amount: '$1,240.00',
  },
  {
    id: '1043',
    customer: 'Contoso Pharmaceuticals',
    issued: 'Nov 5',
    amount: '$86.50',
  },
  { id: '1044', customer: 'Fabrikam', issued: 'Nov 9', amount: '$12,900.00' },
  {
    id: '1045',
    customer: 'Tailspin Toys',
    issued: 'Nov 12',
    amount: '$430.25',
  },
];

const meta = {
  title: 'Aria/Table',
  component: Table,
  args: {
    'aria-label': 'Invoices',
    emptyState: {
      title: 'No invoices yet',
      description: 'Invoices appear here once the first one is issued.',
    },
  },
} satisfies Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The table's columns and the given rows; extra body content (a load-more row) goes last. */
const InvoiceTable = ({
  rows,
  loadMore,
  ...props
}: TableProps & { rows: readonly Invoice[]; loadMore?: ReactNode }) => (
  <Table {...props}>
    <TableHeader>
      <Column isRowHeader width='xs'>
        Number
      </Column>
      <Column>Customer</Column>
      <Column width='sm'>Issued</Column>
      <Column width='md' align='end'>
        Amount
      </Column>
    </TableHeader>
    <TableBody>
      {rows.map((invoice) => (
        <Row key={invoice.id} id={invoice.id}>
          <Cell>{invoice.id}</Cell>
          <Cell>{invoice.customer}</Cell>
          <Cell>{invoice.issued}</Cell>
          <Cell align='end'>{invoice.amount}</Cell>
        </Row>
      ))}
      {loadMore}
    </TableBody>
  </Table>
);

const errorNotice = (
  <p
    role='alert'
    className='bg-surface border-destructive text-destructive rounded-lg border p-3 text-sm'
  >
    The invoices could not be read. Check your connection and try again.
  </p>
);

export const Default: Story = {
  render: (args) => <InvoiceTable {...args} rows={invoices} />,
};

const PressableTable = (args: TableProps) => {
  const [opened, setOpened] = useState<string>();
  return (
    <div className='flex flex-col gap-3'>
      <InvoiceTable
        {...args}
        rows={invoices}
        onRowAction={(key) => setOpened(String(key))}
      />
      <p className='text-canvas-foreground-muted text-sm'>
        Opened: {opened ?? 'none yet'}
      </p>
    </div>
  );
};

/** Rows given an action are pressed as a whole and light up on hover. */
export const WithRowAction: Story = {
  render: (args) => <PressableTable {...args} />,
};

export const Selectable: Story = {
  render: (args) => (
    <InvoiceTable
      {...args}
      rows={invoices}
      selectionMode='multiple'
      selectionBehavior='replace'
      defaultSelectedKeys={['1043']}
    />
  ),
};

/** The read succeeded with no rows: the empty state, with an action. */
export const Empty: Story = {
  args: {
    emptyState: {
      title: 'No invoices yet',
      description: 'Invoices appear here once the first one is issued.',
      actions: (
        <Button variant='solid' tone='primary'>
          Create invoice
        </Button>
      ),
    },
  },
  render: (args) => <InvoiceTable {...args} rows={[]} />,
};

/** The first read is on its way. */
export const Pending: Story = {
  render: (args) => (
    <InvoiceTable
      {...args}
      rows={[]}
      isPending
      pendingText='Loading invoices'
    />
  ),
};

/** The first read failed: the app's notice above, and an empty body that claims nothing. */
export const Failed: Story = {
  render: (args) => <InvoiceTable {...args} rows={[]} error={errorNotice} />,
};

/** A refresh failed: the notice above, and the rows already read stay on screen. */
export const RefreshFailed: Story = {
  render: (args) => (
    <InvoiceTable {...args} rows={invoices} error={errorNotice} />
  ),
};

/** The end of a paged table while the next page is read. */
export const LoadingMore: Story = {
  render: (args) => (
    <InvoiceTable
      {...args}
      rows={invoices}
      loadMore={
        <TableLoadMore
          isLoading
          pendingText='Loading more invoices'
          onLoadMore={() => undefined}
        />
      }
    />
  ),
};
