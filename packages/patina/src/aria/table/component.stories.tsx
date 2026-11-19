import type { Meta, StoryObj } from '@storybook/react-vite';
import { IconReceipt } from '@tabler/icons-react';
import { useState } from 'react';
import { expect, waitFor, within } from 'storybook/test';

import { Pagination } from '../../composites/pagination/index.js';
import {
  contrastRatio,
  edgeColor,
  NON_TEXT_CONTRAST,
  paintedColor,
  surfaceBehind,
} from '../../internal/contrast.testing.js';
import { TRANSPARENT } from '../../internal/itemstate.testing.js';
import {
  LIVE_ANNOUNCER_CLEAR_MS,
  LIVE_ANNOUNCER_MESSAGE,
} from '../../internal/liveannouncer.testing.js';
import { Button } from '../button/index.js';
import { SearchField } from '../searchfield/index.js';
import {
  Cell,
  Column,
  Row,
  Table,
  TableBody,
  TableHeader,
  type TableProps,
} from './index.js';

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

/**
 * A selected row's bar, as the browser draws it: the first cell's `::before`, 2px of the primary
 * color (`tableRowStyles`). An unselected row draws none, so its color is transparent.
 */
const barOf = (row: HTMLElement) => {
  const cell = row.firstElementChild;
  if (cell === null) {
    throw new Error('The row has no cells.');
  }
  const bar = getComputedStyle(cell, '::before');
  return { width: bar.width, color: bar.backgroundColor };
};

/** Where an element's text starts on screen. */
const textStart = (element: Element) => {
  const range = document.createRange();
  range.selectNodeContents(element);
  return range.getBoundingClientRect().left;
};

/** The mark a selection checkbox draws: the last part of React Aria's label, after its hidden input. */
const markOf = (checkbox: HTMLInputElement) => {
  const mark = checkbox
    .closest('label')
    ?.querySelector<HTMLElement>(':scope > span:last-child');
  if (!mark) {
    throw new Error('The checkbox draws no mark.');
  }
  return mark;
};

/** The glyph a check mark shows, by Tabler's class, and whether it can be seen. */
const glyphOf = (checkbox: HTMLInputElement) => {
  const glyph = markOf(checkbox).querySelector('svg');
  if (!glyph) {
    throw new Error('The check mark draws no glyph.');
  }
  return {
    isDash: glyph.classList.contains('tabler-icon-minus'),
    isShown: getComputedStyle(glyph).opacity === '1',
  };
};

/** The table's columns, each as wide as its content, and the given rows. */
const InvoiceTable = ({
  rows,
  ...props
}: TableProps & { rows: readonly Invoice[] }) => (
  <Table {...props}>
    <TableHeader>
      <Column isRowHeader>Number</Column>
      <Column>Customer</Column>
      <Column>Issued</Column>
      <Column align='end'>Amount</Column>
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
    </TableBody>
  </Table>
);

const errorNotice = (
  <p
    role='alert'
    className='bg-surface border-error text-error rounded-lg border p-3 text-sm'
  >
    The invoices could not be read. Check your connection and try again.
  </p>
);

/**
 * The table, each column as wide as its content. A column's heading starts where its values do,
 * and a heading reached from the keyboard draws the shared focus ring.
 */
export const Default: Story = {
  render: (args) => <InvoiceTable {...args} rows={invoices} />,
  play: async ({ canvas, canvasElement, userEvent }) => {
    await expect(
      textStart(canvas.getByRole('columnheader', { name: 'Number' })),
    ).toBe(textStart(canvas.getByRole('rowheader', { name: '1042' })));
    await expect(
      textStart(canvas.getByRole('columnheader', { name: 'Customer' })),
    ).toBe(textStart(canvas.getByText('Northwind Traders')));

    // A heading reached from the keyboard draws the shared focus ring: Tab to the first row, Right
    // to its first cell, Up to the cell's heading.
    await userEvent.keyboard('{Tab}{ArrowRight}{ArrowUp}');
    const heading = canvas.getByRole('columnheader', { name: 'Number' });
    await expect(heading).toHaveFocus();
    const ring = canvasElement.ownerDocument.createElement('div');
    ring.className = 'outline-focus-ring';
    canvasElement.append(ring);
    const style = getComputedStyle(heading);
    await expect(style.outlineColor).toBe(getComputedStyle(ring).outlineColor);
    await expect(style.outlineWidth).toBe('2px');
    ring.remove();
  },
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

/**
 * Rows that select, replacing the selection on a press, marked as a `GridList`'s rows are: a
 * selected row has its tint and, so that color is not the only sign, a 2px primary bar at its start,
 * drawn over its first cell, so selecting never moves its cells.
 */
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
  play: async ({ canvas, userEvent }) => {
    // A row is named by its row header, the invoice's number.
    const row = (name: string) => canvas.getByRole('row', { name });
    // The table draws no fill of its own: the surface is its frame's, behind it.
    const surface = surfaceBehind(canvas.getByRole('grid'));
    const contoso = row('1043');
    const fabrikam = row('1044');
    const selected = barOf(contoso);
    await expect(selected.width).toBe('2px');
    await expect(contrastRatio(selected.color, surface)).toBeGreaterThanOrEqual(
      NON_TEXT_CONTRAST,
    );
    await expect(barOf(fabrikam).color).toBe(TRANSPARENT);
    // The tint: a selected row's fill differs from an unselected one's.
    const unselectedFill = getComputedStyle(fabrikam).backgroundColor;
    await expect(getComputedStyle(contoso).backgroundColor).not.toBe(
      unselectedFill,
    );

    // The mark follows the selection, and the row's cells stay where they were.
    const text = within(fabrikam).getByText('Fabrikam');
    const left = text.getBoundingClientRect().left;
    await userEvent.click(fabrikam);
    await expect(fabrikam).toHaveAttribute('aria-selected', 'true');
    await expect(barOf(fabrikam).color).toBe(selected.color);
    await expect(barOf(contoso).color).toBe(TRANSPARENT);
    await expect(text.getBoundingClientRect().left).toBe(left);
  },
};

/**
 * Several rows selected with checkboxes, the default `selectionBehavior='toggle'`: a press on a row or
 * its checkbox adds it to the selection or takes it out, and the header's checkbox selects every
 * row, showing a dash while only some are selected.
 */
export const SelectSeveral: Story = {
  render: (args) => (
    <InvoiceTable
      {...args}
      rows={invoices}
      selectionMode='multiple'
      defaultSelectedKeys={['1043']}
    />
  ),
  play: async ({ canvas, userEvent }) => {
    const all = canvas.getByRole<HTMLInputElement>('checkbox', {
      name: 'Select All',
    });
    // React Aria names each row's checkbox with the row's header.
    const one = (number: string) =>
      canvas.getByRole<HTMLInputElement>('checkbox', {
        name: `Select ${number}`,
      });
    const fill = (checkbox: HTMLInputElement) =>
      getComputedStyle(markOf(checkbox)).backgroundColor;
    const unchecked = fill(one('1044'));
    await expect(one('1043')).toBeChecked();
    await expect(one('1044')).not.toBeChecked();
    // A checked mark is filled and shows its check; an unchecked one is neither.
    await expect(fill(one('1043'))).not.toBe(unchecked);
    await expect(glyphOf(one('1043'))).toEqual({
      isDash: false,
      isShown: true,
    });
    await expect(glyphOf(one('1044')).isShown).toBe(false);
    // With only some rows selected, the select-all is filled and shows a dash.
    await expect(all.indeterminate).toBe(true);
    await expect(fill(all)).not.toBe(unchecked);
    await expect(glyphOf(all)).toEqual({ isDash: true, isShown: true });
    // The selection column lines up: the select-all over the rows' marks.
    await expect(markOf(all).getBoundingClientRect().left).toBe(
      markOf(one('1042')).getBoundingClientRect().left,
    );

    await userEvent.click(one('1044'));
    await expect(canvas.getByRole('row', { name: '1044' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    await expect(one('1043')).toBeChecked();

    await userEvent.click(all);
    await expect(all).toBeChecked();
    await expect(all.indeterminate).toBe(false);
    await expect(glyphOf(all)).toEqual({ isDash: false, isShown: true });
    for (const number of ['1042', '1043', '1044', '1045']) {
      await expect(one(number)).toBeChecked();
    }

    // With nothing selected, the select-all is off on the header's neutral fill: its edge, the
    // header's text color, keeps 3:1 there, where a control's edge would not.
    await userEvent.click(all);
    await expect(all).not.toBeChecked();
    const header = all.closest('thead');
    if (!header) {
      throw new Error('The select-all stands in no header.');
    }
    await expect(
      contrastRatio(
        edgeColor(markOf(all)),
        getComputedStyle(header).backgroundColor,
      ),
    ).toBeGreaterThanOrEqual(NON_TEXT_CONTRAST);
  },
};

/**
 * A table that selects several rows, with none yet: React Aria disables the select-all while there
 * is no row to select, and it looks disabled.
 */
export const SelectSeveralWhileEmpty: Story = {
  render: (args) => (
    <InvoiceTable {...args} rows={[]} selectionMode='multiple' />
  ),
  play: async ({ canvas }) => {
    const all = canvas.getByRole<HTMLInputElement>('checkbox', {
      name: 'Select All',
    });
    await expect(all).toBeDisabled();
    const label = all.closest('label');
    if (!label) {
      throw new Error('The select-all has no label.');
    }
    await expect(getComputedStyle(label).opacity).toBe('0.5');
  },
};

/**
 * One row selected, with round marks as a radio's: a press on another row or its mark selects it in
 * place of the one before. The header has no select-all; its column is named for assistive technology.
 */
export const SelectOne: Story = {
  render: (args) => (
    <InvoiceTable
      {...args}
      rows={invoices}
      selectionMode='single'
      defaultSelectedKeys={['1043']}
    />
  ),
  play: async ({ canvas, userEvent }) => {
    const one = (number: string) =>
      canvas.getByRole<HTMLInputElement>('checkbox', {
        name: `Select ${number}`,
      });
    await expect(
      canvas.getByRole('columnheader', { name: 'Select' }),
    ).toBeVisible();
    await expect(
      canvas.queryByRole('checkbox', { name: 'Select All' }),
    ).toBeNull();
    const mark = markOf(one('1043'));
    // Round: its corner radius is half its size or more.
    await expect(
      Number.parseFloat(getComputedStyle(mark).borderTopLeftRadius),
    ).toBeGreaterThanOrEqual(mark.getBoundingClientRect().width / 2);
    // The chosen mark shows its dot, and the others do not.
    const dotShown = (number: string) => {
      const dot = markOf(one(number)).querySelector('span');
      if (!dot) {
        throw new Error('The round mark draws no dot.');
      }
      return getComputedStyle(dot).opacity === '1';
    };
    await expect(dotShown('1043')).toBe(true);
    await expect(dotShown('1045')).toBe(false);
    // The chosen mark's edge turns primary and keeps 3:1 on its row's tint, painted over the
    // table's surface, at rest and under the pointer.
    const surface = surfaceBehind(canvas.getByRole('grid'));
    const edgeOnTint = () =>
      contrastRatio(
        edgeColor(markOf(one('1043'))),
        paintedColor(
          surface,
          getComputedStyle(canvas.getByRole('row', { name: '1043' }))
            .backgroundColor,
        ),
      );
    await expect(edgeOnTint()).toBeGreaterThanOrEqual(NON_TEXT_CONTRAST);
    await userEvent.hover(canvas.getByRole('row', { name: '1043' }));
    await expect(edgeOnTint()).toBeGreaterThanOrEqual(NON_TEXT_CONTRAST);

    await userEvent.click(one('1045'));
    await expect(one('1045')).toBeChecked();
    await expect(one('1043')).not.toBeChecked();
    await expect(dotShown('1045')).toBe(true);
    await expect(dotShown('1043')).toBe(false);
  },
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

/**
 * The read succeeded with no rows, and the app gives content of its own in place of the
 * `EmptyState` control's props, such as a picture beside the words: drawn centered where the empty
 * state stands, in the table's one empty row.
 */
export const EmptyWithContent: Story = {
  args: {
    emptyState: (
      <>
        <IconReceipt
          aria-hidden
          className='text-surface-foreground-muted size-8'
        />
        <p className='text-surface-foreground text-sm font-medium'>
          No invoices yet
        </p>
        <p className='text-surface-foreground-muted text-sm'>
          Invoices appear here once the first one is issued.
        </p>
      </>
    ),
  },
  render: (args) => <InvoiceTable {...args} rows={[]} />,
  play: async ({ canvas }) => {
    const table = canvas.getByRole('grid', { name: 'Invoices' });
    const title = canvas.getByText('No invoices yet');
    await expect(table.querySelector('tbody')?.contains(title)).toBe(true);
    const tableBox = table.getBoundingClientRect();
    const titleBox = title.getBoundingClientRect();
    await expect(
      Math.abs(
        (titleBox.left + titleBox.right) / 2 -
          (tableBox.left + tableBox.right) / 2,
      ),
    ).toBeLessThan(1);
  },
};

/** The tools row's boxes: the row, its filter's slot and its pagination's slot. */
const toolsOf = (table: HTMLElement) => {
  // The table stands in its scroller, in its frame, in the table's root, whose first child is the
  // tools row.
  const row =
    table.parentElement?.parentElement?.parentElement?.firstElementChild;
  const [filter, pages] = row ? Array.from(row.children) : [];
  if (!row || !filter || !pages) {
    throw new Error('The table has no tools row with two slots.');
  }
  return {
    row: row.getBoundingClientRect(),
    filter: filter.getBoundingClientRect(),
    pages: pages.getBoundingClientRect(),
  };
};

// A table with a tools row has no Load more bar, so it is given only the table's name and empty state.
const FindableInvoices = (
  args: Pick<TableProps, 'aria-label' | 'emptyState'>,
) => (
  <InvoiceTable
    {...args}
    rows={invoices}
    filter={<SearchField aria-label='Find invoices' placeholder='Northwind' />}
    pagination={<Pagination aria-label='Invoice pages' pageCount={3} />}
  />
);

/**
 * A table that holds every row, with a search box (`filter`) and a pages' control (`pagination`) in
 * the row above it, as Cloudscape's: the filter at the start, growing to fill the row, and the
 * pagination at the end, both above the table's frame.
 */
export const ToolsRow: Story = {
  render: (args) => <FindableInvoices {...args} />,
  play: async ({ canvas }) => {
    const table = canvas.getByRole('grid', { name: 'Invoices' });
    const { row, filter, pages } = toolsOf(table);
    await expect(filter.left).toBe(row.left);
    await expect(pages.right).toBe(row.right);
    // One row: the filter grows up to the 20px gap before the pagination.
    await expect(filter.bottom).toBe(pages.bottom);
    await expect(pages.left - filter.right).toBe(20);
    // Above the table's frame.
    await expect(row.bottom).toBeLessThanOrEqual(
      table.getBoundingClientRect().top,
    );
  },
};

/**
 * The same table where the row is narrower than Cloudscape's small breakpoint (688px): the filter
 * takes the whole row, and the pagination wraps under it, still at the end.
 */
export const ToolsRowNarrow: Story = {
  render: (args) => (
    <div className='w-[30rem]'>
      <FindableInvoices {...args} />
    </div>
  ),
  play: async ({ canvas }) => {
    const { row, filter, pages } = toolsOf(
      canvas.getByRole('grid', { name: 'Invoices' }),
    );
    await expect(filter.left).toBe(row.left);
    await expect(filter.right).toBe(row.right);
    await expect(pages.top).toBeGreaterThanOrEqual(filter.bottom);
    await expect(pages.right).toBe(row.right);
  },
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

const moreInvoices: Invoice[] = [
  { id: '1046', customer: 'Wingtip Toys', issued: 'Nov 14', amount: '$75.00' },
  {
    id: '1047',
    customer: 'Adventure Works',
    issued: 'Nov 15',
    amount: '$3,180.40',
  },
];

// A paged table takes no filter and no pagination, so it is given only the table's name and empty state.
const PagedInvoices = (args: Pick<TableProps, 'aria-label' | 'emptyState'>) => {
  const [rows, setRows] = useState<readonly Invoice[]>(invoices);
  const [isReading, setIsReading] = useState(false);
  const hasMore = rows.length < invoices.length + moreInvoices.length;
  return (
    <InvoiceTable
      {...args}
      rows={rows}
      loadMore={
        hasMore
          ? {
              text: 'Load more invoices',
              isPending: isReading,
              onLoadMore: () => {
                setIsReading(true);
                // Stands in for the app's read of the next page.
                setTimeout(() => {
                  setRows([...invoices, ...moreInvoices]);
                  setIsReading(false);
                }, 300);
              },
            }
          : undefined
      }
    />
  );
};

/**
 * A paged table: the bar under the rows reads the next page when its button is pressed, as
 * Cloudscape's tables read more, never on its own as the table's end scrolls into view. While the
 * page is read the button shows its spinner and ignores presses; once every page is read, the bar
 * is gone, and the focus its button held moves to the first row the last page read.
 */
export const LoadMore: Story = {
  render: (args) => <PagedInvoices {...args} />,
  play: async ({ canvas, canvasElement, userEvent }) => {
    const rows = () => canvas.getAllByRole('row').length;
    // The header row and four invoices: nothing more is read until the button is pressed.
    await expect(rows()).toBe(5);
    const button = canvas.getByRole('button', { name: 'Load more invoices' });
    await userEvent.click(button);
    await expect(button).toHaveAttribute('data-pending', 'true');
    await waitFor(() => expect(rows()).toBe(7));
    await expect(
      canvas.queryByRole('button', { name: 'Load more invoices' }),
    ).toBeNull();
    // The button had the focus as the bar went: it moves to the first row the last page read.
    await expect(canvas.getByRole('row', { name: '1046' })).toHaveFocus();

    // React Aria announced the pending button, now gone (see `LIVE_ANNOUNCER_MESSAGE`).
    await waitFor(
      () =>
        expect(
          canvasElement.ownerDocument.querySelector(LIVE_ANNOUNCER_MESSAGE),
        ).toBeNull(),
      { timeout: LIVE_ANNOUNCER_CLEAR_MS },
    );
  },
};
