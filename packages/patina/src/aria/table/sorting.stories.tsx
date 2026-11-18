import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import type { Key, SortDescriptor } from 'react-aria-components';
import { expect, within } from 'storybook/test';

import { TRANSPARENT } from '../../internal/itemstate.testing.js';
import {
  Cell,
  Column,
  Row,
  Table,
  TableBody,
  TableHeader,
  type TableProps,
} from './index.js';

type Invoice = {
  id: string;
  customer: string;
  /** The issue date as an ISO date, which sorts as text. */
  issued: string;
  amount: number;
  status: string;
};

const invoices: Invoice[] = [
  {
    id: '1042',
    customer: 'Northwind Traders',
    issued: '2026-11-02',
    amount: 1240,
    status: 'Paid',
  },
  {
    id: '1043',
    customer: 'Contoso Pharmaceuticals',
    issued: '2026-11-05',
    amount: 86.5,
    status: 'Overdue',
  },
  {
    id: '1044',
    customer: 'Fabrikam',
    issued: '2026-11-09',
    amount: 12_900,
    status: 'Draft',
  },
  {
    id: '1045',
    customer: 'Tailspin Toys',
    issued: '2026-11-12',
    amount: 430.25,
    status: 'Paid',
  },
];

const collator = new Intl.Collator('en-US');
const day = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  timeZone: 'UTC',
});
const money = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

/** How the app orders its rows by each sortable column, ascending. */
const comparators: Partial<Record<Key, (a: Invoice, b: Invoice) => number>> = {
  id: (a, b) => Number(a.id) - Number(b.id),
  customer: (a, b) => collator.compare(a.customer, b.customer),
  issued: (a, b) => collator.compare(a.issued, b.issued),
  amount: (a, b) => a.amount - b.amount,
};

/** The rows in the order the sort asks for: the app's to do, never the table's. */
const sortedBy = (rows: readonly Invoice[], sort: SortDescriptor) => {
  const compare = comparators[sort.column];
  if (compare === undefined) {
    return rows;
  }
  const ascending = [...rows].sort(compare);
  return sort.direction === 'descending' ? ascending.reverse() : ascending;
};

const meta = {
  title: 'Aria/Table/Sorting',
  component: Table,
  args: {
    'aria-label': 'Invoices',
    emptyState: { title: 'No invoices yet' },
  },
} satisfies Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Every column but Status sorts; the app holds the sort and orders the rows. */
const SortableInvoices = (props: TableProps) => {
  const [sort, setSort] = useState<SortDescriptor>({
    column: 'id',
    direction: 'ascending',
  });
  return (
    <Table {...props} sortDescriptor={sort} onSortChange={setSort}>
      <TableHeader>
        <Column id='id' isRowHeader allowsSorting>
          Number
        </Column>
        <Column id='customer' allowsSorting>
          Customer
        </Column>
        <Column id='issued' allowsSorting>
          Issued
        </Column>
        <Column id='amount' allowsSorting align='end'>
          Amount
        </Column>
        <Column id='status'>Status</Column>
      </TableHeader>
      <TableBody items={sortedBy(invoices, sort)}>
        {(invoice) => (
          <Row id={invoice.id}>
            <Cell>{invoice.id}</Cell>
            <Cell>{invoice.customer}</Cell>
            <Cell>{day.format(new Date(invoice.issued))}</Cell>
            <Cell align='end'>{money.format(invoice.amount)}</Cell>
            <Cell>{invoice.status}</Cell>
          </Row>
        )}
      </TableBody>
    </Table>
  );
};

/** Tabler's name for the mark a heading draws, such as `caret-up-filled`, or none. */
const markOf = (heading: HTMLElement) => {
  const glyph = heading.querySelector('svg');
  if (glyph === null) {
    return null;
  }
  const name = Array.from(glyph.classList).find((name) =>
    name.startsWith('tabler-icon-'),
  );
  return name?.slice('tabler-icon-'.length) ?? null;
};

/** The numbers of the invoices, in the order the rows show them. */
const order = (root: HTMLElement) =>
  within(root)
    .getAllByRole('rowheader')
    .map((cell) => cell.textContent);

/**
 * The keys that reach a heading from the keyboard: Tab into the table, Right along the first row to
 * the column's cell, and Up to its heading.
 */
const toHeading = (column: number) =>
  `{Tab}${'{ArrowRight}'.repeat(column)}{ArrowUp}`;

/**
 * A sortable heading ends with a caret: outlined while its column is not the one sorted, filled
 * and pointing up while ascending, down while descending. The first press on a heading sorts by it
 * ascending; the next ones turn the direction over, as Cloudscape's. Under the pointer a sortable
 * heading takes the neutral hover fill; a heading that does not sort has neither mark nor fill.
 */
export const Sortable: Story = {
  render: (args) => <SortableInvoices {...args} />,
  play: async ({ canvas, canvasElement, userEvent }) => {
    const heading = (name: string) =>
      canvas.getByRole('columnheader', { name });
    await expect(heading('Number')).toHaveAttribute('aria-sort', 'ascending');
    await expect(markOf(heading('Number'))).toBe('caret-up-filled');
    await expect(heading('Customer')).toHaveAttribute('aria-sort', 'none');
    await expect(markOf(heading('Customer'))).toBe('caret-down');
    await expect(heading('Status')).not.toHaveAttribute('aria-sort');
    await expect(markOf(heading('Status'))).toBeNull();

    // From the keyboard: Amount is the fourth cell along, and Enter, then Space, sort by it.
    await userEvent.keyboard(toHeading(4));
    await expect(heading('Amount')).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(heading('Amount')).toHaveAttribute('aria-sort', 'ascending');
    await expect(heading('Number')).toHaveAttribute('aria-sort', 'none');
    await expect(markOf(heading('Number'))).toBe('caret-down');
    await expect(order(canvasElement)).toEqual([
      '1043',
      '1045',
      '1042',
      '1044',
    ]);
    await userEvent.keyboard(' ');
    await expect(heading('Amount')).toHaveAttribute('aria-sort', 'descending');
    await expect(heading('Amount')).toHaveFocus();

    // A press sorts by the column, ascending, and the next turns it over.
    await userEvent.click(heading('Customer'));
    await expect(heading('Customer')).toHaveAttribute('aria-sort', 'ascending');
    await expect(heading('Amount')).toHaveAttribute('aria-sort', 'none');
    await expect(order(canvasElement)).toEqual([
      '1043',
      '1044',
      '1042',
      '1045',
    ]);
    await userEvent.click(heading('Customer'));
    await expect(heading('Customer')).toHaveAttribute(
      'aria-sort',
      'descending',
    );
    await expect(markOf(heading('Customer'))).toBe('caret-down-filled');
    await expect(order(canvasElement)).toEqual([
      '1045',
      '1042',
      '1044',
      '1043',
    ]);

    // The hover fill, measured against the token's own color; a heading that does not sort keeps
    // the header's.
    const fill = canvasElement.ownerDocument.createElement('div');
    fill.className = 'bg-neutral-hover';
    canvasElement.append(fill);
    await userEvent.hover(heading('Issued'));
    await expect(getComputedStyle(heading('Issued')).backgroundColor).toBe(
      getComputedStyle(fill).backgroundColor,
    );
    await userEvent.hover(heading('Status'));
    await expect(getComputedStyle(heading('Status')).backgroundColor).toBe(
      TRANSPARENT,
    );
    fill.remove();
  },
};

/**
 * In a resizable table a sortable heading takes the focus itself, so Enter sorts, and the Right
 * arrow moves into its resizer, where Enter starts resizing instead. Neither the resizer's keys nor
 * a press on it sorts.
 */
export const SortableAndResizable: Story = {
  args: { allowsColumnResizing: true },
  render: (args) => <SortableInvoices {...args} />,
  play: async ({ canvas, userEvent }) => {
    // In a resizable table, a heading's name also holds its resizer's value; match it by its text.
    const heading = (name: string) =>
      canvas.getByRole('columnheader', { name: new RegExp(`^${name}`) });
    const customer = heading('Customer');
    await userEvent.keyboard(toHeading(2));
    await expect(customer).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(customer).toHaveAttribute('aria-sort', 'ascending');

    const resizer = within(customer).getByRole('slider');
    await userEvent.keyboard('{ArrowRight}');
    await expect(resizer).toHaveFocus();
    const before = customer.getBoundingClientRect().width;
    await userEvent.keyboard('{Enter}{ArrowRight}{ArrowRight}{Enter}');
    await expect(customer.getBoundingClientRect().width).toBeCloseTo(
      before + 20,
      0,
    );
    await expect(customer).toHaveAttribute('aria-sort', 'ascending');

    // A press on the resizer's handle, the element around its hidden input, does not sort.
    const handle = resizer.parentElement;
    if (handle === null) {
      throw new Error('The resizer has no handle.');
    }
    await userEvent.click(handle);
    await expect(customer).toHaveAttribute('aria-sort', 'ascending');
  },
};
