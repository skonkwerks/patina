import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, waitFor, within } from 'storybook/test';

import { Button } from '../../aria/button/index.js';
import {
  Cell,
  Column,
  Row,
  Table,
  TableBody,
  TableHeader,
} from '../../aria/table/index.js';
import { Header } from '../../header/index.js';
import { Pagination } from '../pagination/index.js';
import { TextFilter } from '../textfilter/index.js';
import { useCollection } from './index.js';

type Invoice = { id: string; customer: string; amount: number };

const customers = [
  'Northwind Traders',
  'Contoso Pharmaceuticals',
  'Fabrikam',
  'Tailspin Toys',
  'Wingtip Toys',
  'Adventure Works',
];

/** Twenty-three invoices, numbered 1001 to 1023, from six customers in turn. */
const invoices: Invoice[] = Array.from({ length: 23 }, (_, index) => ({
  id: String(1001 + index),
  customer: customers[index % customers.length] ?? 'Fabrikam',
  amount: ((index * 7919) % 5000) + 0.5,
}));

const money = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

/**
 * The table Cloudscape's "common features" shows, under the page's heading: search, sorting and
 * pages, all in the browser.
 */
const InvoiceTable = ({ items }: { items: readonly Invoice[] }) => {
  const collection = useCollection(items, {
    emptyState: {
      title: 'No invoices yet',
      description: 'Invoices appear here once the first one is issued.',
    },
    pagination: { pageSize: 10 },
  });
  return (
    <div className='flex flex-col gap-4'>
      <Header title='Billing' />
      <Table
        aria-label='Invoices'
        {...collection.tableProps}
        filter={
          <TextFilter
            label='Find invoices'
            placeholder='Northwind'
            {...collection.filterProps}
          />
        }
        pagination={
          <Pagination
            aria-label='Invoice pages'
            {...collection.paginationProps}
          />
        }
      >
        <TableHeader>
          <Column id='id' isRowHeader allowsSorting>
            Number
          </Column>
          <Column id='customer' allowsSorting>
            Customer
          </Column>
          <Column id='amount' allowsSorting align='end'>
            Amount
          </Column>
        </TableHeader>
        <TableBody items={collection.items}>
          {(invoice) => (
            <Row id={invoice.id}>
              <Cell>{invoice.id}</Cell>
              <Cell>{invoice.customer}</Cell>
              <Cell align='end'>{money.format(invoice.amount)}</Cell>
            </Row>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

const meta = {
  title: 'Composites/useCollection',
  component: InvoiceTable,
  args: { items: invoices },
} satisfies Meta<typeof InvoiceTable>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The numbers of the rows shown, in order. */
const shownIds = (table: HTMLElement) =>
  Array.from(
    table.querySelectorAll('tbody [role="rowheader"]'),
    (cell) => cell.textContent,
  ).join(' ');

/**
 * Ten rows a page, over three pages. A search matches the rows with a field that holds it, counts
 * them after the box, and goes back to the first page; a sort orders every row matched, not only
 * the page's, and goes back to the first page too.
 */
export const SearchSortAndPage: Story = {
  play: async ({ canvas, userEvent }) => {
    const table = canvas.getByRole('grid', { name: 'Invoices' });
    await expect(shownIds(table)).toBe(
      '1001 1002 1003 1004 1005 1006 1007 1008 1009 1010',
    );
    await expect(
      canvas.getByRole('button', { name: 'Page 3' }),
    ).toBeInTheDocument();
    await expect(canvas.queryByRole('button', { name: 'Page 4' })).toBeNull();

    await userEvent.click(canvas.getByRole('button', { name: 'Page 3' }));
    await expect(shownIds(table)).toBe('1021 1022 1023');

    // A search from the third page: "o" is in five of the six customers' names, nineteen
    // invoices, two pages; the search shows the first.
    const box = canvas.getByRole('searchbox', { name: 'Find invoices' });
    await userEvent.type(box, 'o');
    await expect(canvas.getByText('19 matches')).toBeVisible();
    await expect(
      canvas.getByRole('button', { name: 'Page 1' }),
    ).toHaveAttribute('aria-current', 'page');
    await userEvent.click(canvas.getByRole('button', { name: 'Page 2' }));
    await userEvent.clear(box);

    // Toys: Tailspin Toys and Wingtip Toys, eight invoices, one page.
    await userEvent.type(box, 'toys');
    await expect(canvas.getByText('8 matches')).toBeVisible();
    await expect(shownIds(table)).toBe(
      '1004 1005 1010 1011 1016 1017 1022 1023',
    );
    await expect(canvas.queryByRole('button', { name: 'Page 2' })).toBeNull();
    await expect(
      canvas.getByRole('button', { name: 'Page 1' }),
    ).toHaveAttribute('aria-current', 'page');

    // A search for a number looks in the number too.
    await userEvent.clear(box);
    await userEvent.type(box, '1017');
    await expect(shownIds(table)).toBe('1017');
    await userEvent.clear(box);

    // Sorted by amount, from the second page: the first page of every row in that order.
    await userEvent.click(canvas.getByRole('button', { name: 'Page 2' }));
    await userEvent.click(canvas.getByRole('columnheader', { name: 'Amount' }));
    const ordered = [...invoices]
      .sort((a, b) => a.amount - b.amount)
      .slice(0, 10)
      .map((invoice) => invoice.id)
      .join(' ');
    await expect(shownIds(table)).toBe(ordered);
    await expect(
      canvas.getByRole('button', { name: 'Page 1' }),
    ).toHaveAttribute('aria-current', 'page');
  },
};

/**
 * A search that matches no row: the no-match state, in Patina's words, with Clear search. Pressed,
 * it empties the search and the rows come back; the button goes with the no-match state, and the
 * focus goes to the page's heading, which stays, so it does not fall to the document.
 */
export const NoMatch: Story = {
  play: async ({ canvas, userEvent }) => {
    const box = canvas.getByRole('searchbox', { name: 'Find invoices' });
    await userEvent.type(box, 'Globex');
    await expect(canvas.getByText('0 matches')).toBeVisible();
    await expect(canvas.getByText('No matches')).toBeVisible();
    await expect(canvas.getByText('Nothing matches the search.')).toBeVisible();
    await expect(canvas.queryByText('No invoices yet')).toBeNull();

    // The no-match state's own, in the table; the box's clear control, React Aria's, has the same
    // name and does the same.
    within(canvas.getByRole('grid', { name: 'Invoices' }))
      .getByRole('button', { name: 'Clear search' })
      .focus();
    await userEvent.keyboard('{Enter}');
    await expect(box).toHaveValue('');
    await expect(
      canvas.getByRole('heading', { name: 'Billing' }),
    ).toHaveFocus();
    await waitFor(() =>
      expect(
        shownIds(canvas.getByRole('grid', { name: 'Invoices' })),
      ).toContain('1001'),
    );
  },
};

/**
 * No rows at all: the app's empty state, which says what is empty, even while a search is typed,
 * since nothing exists to match.
 */
export const Empty: Story = {
  args: { items: [] },
  play: async ({ canvas, userEvent }) => {
    await expect(canvas.getByText('No invoices yet')).toBeVisible();
    await userEvent.type(
      canvas.getByRole('searchbox', { name: 'Find invoices' }),
      'Globex',
    );
    await expect(canvas.getByText('No invoices yet')).toBeVisible();
    await expect(canvas.queryByText('No matches')).toBeNull();
  },
};

/** The invoices, with the last page's taken away and given back, as a delete and its undo do. */
const ChangingInvoices = () => {
  const [items, setItems] = useState(invoices);
  return (
    <div className='flex flex-col items-start gap-4'>
      <div className='flex gap-2'>
        <Button onPress={() => setItems(invoices.slice(0, 15))}>
          Delete the last 8 invoices
        </Button>
        <Button onPress={() => setItems(invoices)}>Undo</Button>
      </div>
      <InvoiceTable items={items} />
    </div>
  );
};

/**
 * On the last page, the rows shrink to two pages: the table shows the new last page, and stays on
 * it when the rows grow back, rather than moving to another page by itself.
 */
export const RowsChange: Story = {
  render: () => <ChangingInvoices />,
  play: async ({ canvas, userEvent }) => {
    const table = canvas.getByRole('grid', { name: 'Invoices' });
    await userEvent.click(canvas.getByRole('button', { name: 'Page 3' }));
    await expect(shownIds(table)).toBe('1021 1022 1023');

    await userEvent.click(
      canvas.getByRole('button', { name: 'Delete the last 8 invoices' }),
    );
    await expect(shownIds(table)).toBe('1011 1012 1013 1014 1015');
    await expect(
      canvas.getByRole('button', { name: 'Page 2' }),
    ).toHaveAttribute('aria-current', 'page');

    await userEvent.click(canvas.getByRole('button', { name: 'Undo' }));
    await expect(
      canvas.getByRole('button', { name: 'Page 2' }),
    ).toHaveAttribute('aria-current', 'page');
    await expect(shownIds(table)).toBe(
      '1011 1012 1013 1014 1015 1016 1017 1018 1019 1020',
    );
  },
};
