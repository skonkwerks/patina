import type { Meta, StoryObj } from '@storybook/react-vite';
import { type ReactNode, useState } from 'react';
import { expect, within } from 'storybook/test';

import {
  contrastRatio,
  edgeColor,
  NON_TEXT_CONTRAST,
  paintedColor,
} from '../../internal/contrast.testing.js';
import { startEdgeOf, TRANSPARENT } from '../../internal/itemstate.testing.js';
import { Button } from '../button/index.js';
import {
  Cell,
  Column,
  Row,
  Table,
  TableBody,
  TableHeader,
  TableLoadMore,
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
    className='bg-surface border-error text-error rounded-lg border p-3 text-sm'
  >
    The invoices could not be read. Check your connection and try again.
  </p>
);

/**
 * The table, its columns sharing its width. Every body row keeps a 2px start edge for the selected
 * bar, and the header keeps the same edge, so a column's heading starts where its values do.
 */
export const Default: Story = {
  render: (args) => <InvoiceTable {...args} rows={invoices} />,
  play: async ({ canvas }) => {
    await expect(
      textStart(canvas.getByRole('columnheader', { name: 'Number' })),
    ).toBe(textStart(canvas.getByRole('rowheader', { name: '1042' })));
    await expect(
      textStart(canvas.getByRole('columnheader', { name: 'Customer' })),
    ).toBe(textStart(canvas.getByText('Northwind Traders')));
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
 * selected row has its tint and, so that color is not the only sign, a 2px primary bar at its start
 * edge; an unselected row keeps the same edge, transparent, so selecting never moves its cells.
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
    // The table draws no fill of its own: the surface is its frame's, the element around it.
    const frame = canvas.getByRole('grid').parentElement;
    if (frame === null) {
      throw new Error('The table stands in no frame.');
    }
    const surface = getComputedStyle(frame).backgroundColor;
    const contoso = row('1043');
    const fabrikam = row('1044');
    const selected = startEdgeOf(contoso);
    await expect(selected.width).toBe('2px');
    await expect(contrastRatio(selected.color, surface)).toBeGreaterThanOrEqual(
      NON_TEXT_CONTRAST,
    );
    await expect(startEdgeOf(fabrikam)).toEqual({
      width: '2px',
      color: TRANSPARENT,
    });
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
    await expect(startEdgeOf(fabrikam).color).toBe(selected.color);
    await expect(startEdgeOf(contoso).color).toBe(TRANSPARENT);
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
    const frame = canvas.getByRole('grid').parentElement;
    if (frame === null) {
      throw new Error('The table stands in no frame.');
    }
    const surface = getComputedStyle(frame).backgroundColor;
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
  parameters: {
    a11y: {
      config: {
        // Exception to the story axe check (#2): React Aria's TableLoadMoreItem writes aria-level on
        // its grid row after the wrapper's props, so no wrapper can remove it
        // (https://github.com/skonkwerks/patina/issues/1). Only this rule, only this story; remove
        // the override once a React Aria release fixes it.
        rules: [{ id: 'aria-conditional-attr', enabled: false }],
      },
    },
  },
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
