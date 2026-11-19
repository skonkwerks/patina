import type { Meta, StoryObj } from '@storybook/react-vite';
import { IconSettings } from '@tabler/icons-react';
import type { ReactNode } from 'react';
import { expect, within } from 'storybook/test';

import { Pagination } from '../../composites/pagination/index.js';
import {
  contrastRatio,
  paintedColor,
  surfaceBehind,
  TEXT_CONTRAST,
} from '../../internal/contrast.testing.js';
import { TRANSPARENT } from '../../internal/itemstate.testing.js';
import { IconButton } from '../iconbutton/index.js';
import {
  Cell,
  Column,
  Row,
  Table,
  TableBody,
  TableHeader,
  type TableProps,
} from './index.js';

type Invoice = { id: string; customer: string; note: string; amount: string };

const invoices: Invoice[] = [
  {
    id: '1042',
    customer: 'Northwind Traders',
    note: 'Paid',
    amount: '$1,240.00',
  },
  {
    id: '1043',
    customer: 'Contoso Pharmaceuticals',
    note: 'Awaiting the purchase order number from their accounts team before it can be sent',
    amount: '$86.50',
  },
  { id: '1044', customer: 'Fabrikam', note: 'Paid', amount: '$12,900.00' },
  { id: '1045', customer: 'Tailspin Toys', note: 'Overdue', amount: '$430.25' },
];

/** The looks a story gives the table, and the controls in the row above it. */
type LooksProps = Pick<
  TableProps,
  | 'allowsWrapping'
  | 'isStriped'
  | 'isCompact'
  | 'preferences'
  | 'selectionMode'
  | 'defaultSelectedKeys'
> & { pagination?: ReactNode };

/** A table of invoices whose rows open their invoice, so they light up under the pointer. */
const InvoiceTable = ({
  allowsWrapping,
  isStriped,
  isCompact,
  preferences,
  pagination,
  selectionMode,
  defaultSelectedKeys,
}: LooksProps) => (
  <Table
    aria-label='Invoices'
    emptyState={{ title: 'No invoices yet' }}
    onRowAction={() => undefined}
    allowsWrapping={allowsWrapping}
    isStriped={isStriped}
    isCompact={isCompact}
    selectionMode={selectionMode}
    defaultSelectedKeys={defaultSelectedKeys}
    preferences={preferences}
    pagination={pagination}
  >
    <TableHeader>
      <Column isRowHeader>Number</Column>
      <Column>Customer</Column>
      <Column width={240}>Note</Column>
      <Column align='end'>Amount</Column>
    </TableHeader>
    <TableBody items={invoices}>
      {(invoice) => (
        <Row id={invoice.id}>
          <Cell>{invoice.id}</Cell>
          <Cell>{invoice.customer}</Cell>
          <Cell>{invoice.note}</Cell>
          <Cell align='end' allowsWrapping={false}>
            {invoice.amount}
          </Cell>
        </Row>
      )}
    </TableBody>
  </Table>
);

const meta = {
  title: 'Aria/Table/Looks',
  component: InvoiceTable,
} satisfies Meta<typeof InvoiceTable>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A row's fill as drawn, over what stands behind the table. */
const rowFill = (row: Element) =>
  paintedColor(
    surfaceBehind(row.closest('table') ?? row),
    getComputedStyle(row).backgroundColor,
  );

/**
 * Striped rows: every other row on a faint fill, so a row is easier to follow across. The fill
 * keeps the text's contrast, and a row under the pointer shows its hover, and a selected row its
 * selection, striped or not.
 */
export const Striped: Story = {
  args: {
    isStriped: true,
    selectionMode: 'multiple',
    defaultSelectedKeys: ['1042', '1045'],
  },
  play: async ({ canvas, userEvent }) => {
    const first = canvas.getByRole('row', { name: '1042' });
    const second = canvas.getByRole('row', { name: '1043' });
    const third = canvas.getByRole('row', { name: '1044' });
    await expect(getComputedStyle(third).backgroundColor).toBe(TRANSPARENT);
    await expect(getComputedStyle(second).backgroundColor).not.toBe(
      TRANSPARENT,
    );
    const text = getComputedStyle(within(second).getByText('$86.50')).color;
    await expect(contrastRatio(text, rowFill(second))).toBeGreaterThanOrEqual(
      TEXT_CONTRAST,
    );

    // The second and fourth rows are striped; the first is selected, the fourth too.
    const fourth = canvas.getByRole('row', { name: '1045' });
    await expect(rowFill(fourth)).toBe(rowFill(first));

    await userEvent.hover(third);
    const hovered = rowFill(third);
    await userEvent.hover(second);
    await expect(rowFill(second)).toBe(hovered);
  },
};

/**
 * Compact: less room above and below each row's text and each heading, so more rows are in view.
 * A comfortable table has 12px; a compact one, 6px.
 */
export const Compact: Story = {
  args: { isCompact: true },
  play: async ({ canvas }) => {
    const cell = canvas.getByText('Fabrikam').closest('td');
    const heading = canvas.getByRole('columnheader', { name: 'Customer' });
    await expect(cell && getComputedStyle(cell).paddingTop).toBe('6px');
    await expect(getComputedStyle(heading).paddingTop).toBe('6px');
  },
};

/** The default, for comparison: 12px above and below each row's text and each heading. */
export const Comfortable: Story = {
  play: async ({ canvas }) => {
    const cell = canvas.getByText('Fabrikam').closest('td');
    const heading = canvas.getByRole('columnheader', { name: 'Customer' });
    await expect(cell && getComputedStyle(cell).paddingTop).toBe('12px');
    await expect(getComputedStyle(heading).paddingTop).toBe('12px');
  },
};

/**
 * Wrapping lines: every cell wraps its text inside its column, but a cell that says otherwise, as
 * the amounts here do, stays on one line.
 */
export const WrapsLines: Story = {
  args: { allowsWrapping: true },
  play: async ({ canvas }) => {
    const note = canvas.getByText(/Awaiting the purchase order/);
    const noteCell = note.closest('td');
    if (noteCell === null) {
      throw new Error('The note has no cell.');
    }
    const lineHeight = Number.parseFloat(getComputedStyle(noteCell).lineHeight);
    await expect(getComputedStyle(noteCell).whiteSpace).not.toBe('nowrap');
    await expect(noteCell.clientHeight).toBeGreaterThan(lineHeight * 2);
    const amount = canvas.getByText('$86.50').closest('td');
    await expect(amount && getComputedStyle(amount).whiteSpace).toBe('nowrap');
  },
};

/** Without wrapping, a long note is one line, cut where its column ends. */
export const OneLine: Story = {
  play: async ({ canvas }) => {
    const noteCell = canvas
      .getByText(/Awaiting the purchase order/)
      .closest('td');
    await expect(noteCell && getComputedStyle(noteCell).textOverflow).toBe(
      'ellipsis',
    );
  },
};

/**
 * A gear in the place `CollectionPreferences` takes, which needs the app shell's side panel to open
 * in; these stories show the table's row alone (the real one: `Composites/CollectionPreferences`).
 */
const gearStandIn = (
  <IconButton aria-label='Preferences' hasTooltip>
    <IconSettings aria-hidden className='size-4' />
  </IconButton>
);

/**
 * The preferences' control at the end of the row above the table, after the pagination with a
 * line between them, as Cloudscape's.
 */
export const PreferencesAfterPagination: Story = {
  args: {
    pagination: <Pagination aria-label='Invoice pages' pageCount={3} />,
    preferences: gearStandIn,
  },
  play: async ({ canvas }) => {
    const gear = canvas.getByRole('button', { name: 'Preferences' });
    const pages = canvas.getByRole('list', { name: 'Invoice pages' });
    const slot = gear.parentElement;
    if (slot === null) {
      throw new Error('The preferences have no slot.');
    }
    await expect(gear.getBoundingClientRect().left).toBeGreaterThan(
      pages.getBoundingClientRect().right,
    );
    await expect(getComputedStyle(slot).borderInlineStartWidth).toBe('1px');
    // At the end of the row: the slot's group, and the group the row's.
    const row = slot.parentElement?.parentElement;
    await expect(slot.getBoundingClientRect().right).toBe(
      row?.getBoundingClientRect().right,
    );
  },
};

/** The preferences' control alone in the row: at its end, with no line before it. */
export const PreferencesAlone: Story = {
  args: { preferences: gearStandIn },
  play: async ({ canvas }) => {
    const slot = canvas.getByRole('button', {
      name: 'Preferences',
    }).parentElement;
    await expect(slot && getComputedStyle(slot).borderInlineStartWidth).toBe(
      '0px',
    );
  },
};
