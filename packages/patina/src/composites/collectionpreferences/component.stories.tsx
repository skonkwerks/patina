import type { Meta, StoryObj } from '@storybook/react-vite';
import { type ReactNode, useState } from 'react';
import { expect, fn, screen, waitFor, within } from 'storybook/test';

import { Button } from '../../aria/button/index.js';
import {
  Cell,
  Column,
  Row,
  Table,
  TableBody,
  TableHeader,
} from '../../aria/table/index.js';
import { TRANSPARENT } from '../../internal/itemstate.testing.js';
import { AppShell } from '../appshell/index.js';
import { useCollection } from '../collection/index.js';
import { Pagination } from '../pagination/index.js';
import {
  CollectionPreferences,
  type CollectionPreferencesValue,
} from './index.js';

type Invoice = { id: string; customer: string; amount: number };

const customers = ['Northwind Traders', 'Contoso', 'Fabrikam', 'Tailspin Toys'];

/** Thirty invoices, numbered 1001 to 1030. */
const invoices: Invoice[] = Array.from({ length: 30 }, (_, index) => ({
  id: String(1001 + index),
  customer: customers[index % customers.length] ?? 'Fabrikam',
  amount: 100 + index,
}));

/** The invoices, paged and drawn as the app's stored preferences say. */
const InvoiceTable = ({
  initial,
  pageSizeOptions,
  name = 'Invoices',
  preferencesName,
  preferencesTitle,
  onConfirm,
  elsewhere = [],
}: {
  initial: CollectionPreferencesValue;
  pageSizeOptions?: readonly number[];
  /** The table's name. */
  name?: string;
  /** The gear's name, on a page with more than one table. */
  preferencesName?: string;
  /** The side panel's title, where it says more than the gear's name. */
  preferencesTitle?: string;
  /**
   * Told each time the person saves, beside the app's own store, so a story can hold what is
   * sent.
   */
  onConfirm?: (preferences: CollectionPreferencesValue) => void;
  /** Buttons beside the table that store a change of the preferences, as another tab would. */
  elsewhere?: readonly { label: string; change: CollectionPreferencesValue }[];
}) => {
  const [preferences, setPreferences] = useState(initial);
  const collection = useCollection(invoices, {
    emptyState: { title: 'No invoices yet' },
    pagination: { pageSize: preferences.pageSize ?? 10 },
  });
  return (
    <>
      <Table
        aria-label={name}
        {...collection.tableProps}
        isStriped={preferences.isStriped}
        isCompact={preferences.isCompact}
        allowsWrapping={preferences.allowsWrapping}
        pagination={
          <Pagination
            aria-label={`${name} pages`}
            {...collection.paginationProps}
          />
        }
        preferences={
          <CollectionPreferences
            aria-label={preferencesName}
            title={preferencesTitle}
            preferences={preferences}
            onConfirm={(saved) => {
              setPreferences(saved);
              onConfirm?.(saved);
            }}
            pageSizeOptions={pageSizeOptions}
          />
        }
      >
        <TableHeader>
          <Column isRowHeader>Number</Column>
          <Column>Customer</Column>
          <Column align='end'>Amount</Column>
        </TableHeader>
        <TableBody items={collection.items}>
          {(invoice) => (
            <Row id={invoice.id}>
              <Cell>{invoice.id}</Cell>
              <Cell>{invoice.customer}</Cell>
              <Cell align='end'>{invoice.amount}</Cell>
            </Row>
          )}
        </TableBody>
      </Table>
      {elsewhere.map(({ label, change }) => (
        <Button
          key={label}
          onPress={() => setPreferences((stored) => ({ ...stored, ...change }))}
        >
          {label}
        </Button>
      ))}
    </>
  );
};

/** The table in the app shell, whose side panel the preferences open in. */
const InShell = ({
  children,
  ...props
}: Parameters<typeof InvoiceTable>[0] & { children?: ReactNode }) => (
  <div className='h-[40rem]'>
    <AppShell
      sidebar={<nav aria-label='Main' className='w-48' />}
      panelCloseLabel='Close'
    >
      <div className='flex flex-col gap-6 p-6'>
        <InvoiceTable {...props} />
        {children}
      </div>
    </AppShell>
  </div>
);

const meta = {
  title: 'Composites/CollectionPreferences',
  component: InShell,
  parameters: { layout: 'fullscreen' },
  args: {
    initial: {
      pageSize: 10,
      allowsWrapping: false,
      isStriped: false,
      isCompact: false,
    },
    pageSizeOptions: [10, 20, 50],
    onConfirm: fn(),
  },
} satisfies Meta<typeof InShell>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Waits until the side panel has finished opening: its width's transition has run. Until then the
 * panel scrolls sideways as it widens, and React Aria closes a tooltip when anything around its
 * trigger scrolls, so a tooltip opened in the panel meanwhile closes at once.
 */
const settled = (panel: HTMLElement) =>
  waitFor(() => expect(panel.getAnimations()).toHaveLength(0));

/** The rows the table shows. */
const rowCount = (table: HTMLElement) =>
  table.querySelectorAll('tbody [role="row"]').length;

/**
 * The gear at the end of the row above the table opens the preferences in the side panel, beside
 * the table: page size, then wrapped lines, striped rows and compact rows, as the app holds them.
 * Save gives them to the app, which draws the table so, and closes the panel; the focus goes back
 * to the gear.
 */
export const Default: Story = {
  play: async ({ args, canvas, userEvent }) => {
    const table = canvas.getByRole('grid', { name: 'Invoices' });
    await expect(rowCount(table)).toBe(10);
    const gear = canvas.getByRole('button', { name: 'Preferences' });
    await userEvent.click(gear);

    const panel = await canvas.findByRole('complementary', {
      name: 'Preferences',
    });
    await settled(panel);
    const form = within(panel);
    // Nothing changed yet: Save says so when Tab reaches it, and pressing it sends nothing and
    // keeps the panel open.
    const save = form.getByRole('button', { name: 'Save' });
    await expect(save).toHaveAttribute('aria-disabled', 'true');
    form.getByRole('checkbox', { name: 'Compact rows' }).focus();
    await userEvent.tab();
    await userEvent.tab();
    await expect(save).toHaveFocus();
    await expect(await screen.findByRole('tooltip')).toHaveTextContent(
      'Nothing has changed',
    );
    await userEvent.click(save);
    await expect(panel).toBeInTheDocument();
    await expect(args.onConfirm).not.toHaveBeenCalled();
    // A submit that doesn't come through Save, such as a browser's own from a field, sends nothing
    // either: the submit holds the same reason (`react/react-aria.md`), and the panel stays.
    const element = panel.querySelector('form');
    if (!(element instanceof HTMLFormElement)) {
      throw new Error('The panel holds no form to submit.');
    }
    element.requestSubmit();
    await expect(panel).toBeInTheDocument();
    await expect(args.onConfirm).not.toHaveBeenCalled();
    await expect(form.getByRole('radio', { name: '10 rows' })).toBeChecked();
    await expect(
      form.getByRole('checkbox', { name: 'Striped rows' }),
    ).not.toBeChecked();
    await expect(
      form.getByRole('checkbox', { name: 'Wrapped lines' }),
    ).toBeInTheDocument();
    await expect(
      form.getByRole('checkbox', { name: 'Compact rows' }),
    ).toBeInTheDocument();

    await userEvent.click(form.getByRole('radio', { name: '20 rows' }));
    await userEvent.click(form.getByRole('checkbox', { name: 'Striped rows' }));
    // Nothing changes before Save, which can now be pressed.
    await expect(rowCount(table)).toBe(10);
    await expect(save).not.toHaveAttribute('aria-disabled');
    await userEvent.click(form.getByRole('button', { name: 'Save' }));

    await waitFor(() =>
      expect(canvas.queryByRole('complementary')).not.toBeInTheDocument(),
    );
    await waitFor(() => expect(gear).toHaveFocus());
    await expect(args.onConfirm).toHaveBeenCalledTimes(1);
    await expect(args.onConfirm).toHaveBeenCalledWith({
      pageSize: 20,
      allowsWrapping: false,
      isStriped: true,
      isCompact: false,
    });
    await expect(rowCount(table)).toBe(20);
    const second = canvas.getByRole('row', { name: '1002' });
    await expect(getComputedStyle(second).backgroundColor).not.toBe(
      TRANSPARENT,
    );

    // Opened again, the form starts from what was saved.
    await userEvent.click(gear);
    const again = within(
      await canvas.findByRole('complementary', { name: 'Preferences' }),
    );
    await expect(again.getByRole('radio', { name: '20 rows' })).toBeChecked();
    await expect(
      again.getByRole('checkbox', { name: 'Striped rows' }),
    ).toBeChecked();
  },
};

/**
 * Cancel, or Escape, drops the changes: the table stays as it was, and the focus goes back to the
 * gear.
 */
export const CancelDropsChanges: Story = {
  play: async ({ canvas, userEvent }) => {
    const table = canvas.getByRole('grid', { name: 'Invoices' });
    const gear = canvas.getByRole('button', { name: 'Preferences' });

    await userEvent.click(gear);
    let form = within(
      await canvas.findByRole('complementary', { name: 'Preferences' }),
    );
    await userEvent.click(form.getByRole('radio', { name: '50 rows' }));
    await userEvent.click(form.getByRole('button', { name: 'Cancel' }));
    await waitFor(() => expect(gear).toHaveFocus());
    await expect(rowCount(table)).toBe(10);

    await userEvent.click(gear);
    form = within(
      await canvas.findByRole('complementary', { name: 'Preferences' }),
    );
    await expect(form.getByRole('radio', { name: '10 rows' })).toBeChecked();
    await userEvent.click(form.getByRole('radio', { name: '50 rows' }));
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(gear).toHaveFocus());
    await expect(rowCount(table)).toBe(10);
  },
};

/**
 * The form offers only the preferences the app holds: here, striped rows alone, and no page size,
 * since the app gives no sizes.
 */
export const OnlyHeldPreferences: Story = {
  args: { initial: { isStriped: true }, pageSizeOptions: undefined },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Preferences' }));
    const form = within(
      await canvas.findByRole('complementary', { name: 'Preferences' }),
    );
    await expect(
      form.getByRole('checkbox', { name: 'Striped rows' }),
    ).toBeChecked();
    await expect(form.queryByRole('radiogroup')).toBeNull();
    await expect(form.getAllByRole('checkbox')).toHaveLength(1);
  },
};

/**
 * A page with two tables: each gear is named for its table, and its panel is titled so, as
 * `ux/editing-surfaces.md` has a drawer name what it is about: with its own title where one is
 * given, and the gear's name otherwise.
 */
export const TwoTables: Story = {
  args: { name: 'Invoices', preferencesName: 'Invoice preferences' },
  render: (args) => (
    <InShell {...args}>
      <InvoiceTable
        initial={{ isStriped: false }}
        name='Customers'
        preferencesName='Customer preferences'
        preferencesTitle='Customer table preferences'
      />
    </InShell>
  ),
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(
      canvas.getByRole('button', { name: 'Customer preferences' }),
    );
    await expect(
      await canvas.findByRole('complementary', {
        name: 'Customer table preferences',
      }),
    ).toBeInTheDocument();

    // The invoices' gear takes the panel over, titled with its own name, as no title is given.
    await userEvent.click(
      canvas.getByRole('button', { name: 'Invoice preferences' }),
    );
    await expect(
      await canvas.findByRole('complementary', { name: 'Invoice preferences' }),
    ).toBeInTheDocument();
  },
};

/**
 * A preference stored elsewhere while the form is open, as from another tab: the form shows the
 * newer value wherever the person hasn't changed that preference, and keeps their own value where
 * they have (`ux/forms.md`, "Save and Cancel").
 */
export const NewerStoredValue: Story = {
  args: {
    elsewhere: [
      { label: 'Store 50 rows', change: { pageSize: 50 } },
      {
        label: 'Store 20 plain rows',
        change: { pageSize: 20, isStriped: false },
      },
    ],
  },
  play: async ({ canvas, userEvent }) => {
    const table = canvas.getByRole('grid', { name: 'Invoices' });
    await userEvent.click(canvas.getByRole('button', { name: 'Preferences' }));
    const form = within(
      await canvas.findByRole('complementary', { name: 'Preferences' }),
    );
    const save = form.getByRole('button', { name: 'Save' });

    // Nothing staged: the newer page size replaces the one the form opened on, and there is still
    // nothing to save.
    await userEvent.click(
      canvas.getByRole('button', { name: 'Store 50 rows' }),
    );
    await expect(form.getByRole('radio', { name: '50 rows' })).toBeChecked();
    await expect(save).toHaveAttribute('aria-disabled', 'true');

    // Striped rows staged: a newer stored value keeps it, and takes the page size it didn't touch.
    await userEvent.click(form.getByRole('checkbox', { name: 'Striped rows' }));
    await userEvent.click(
      canvas.getByRole('button', { name: 'Store 20 plain rows' }),
    );
    await expect(form.getByRole('radio', { name: '20 rows' })).toBeChecked();
    await expect(
      form.getByRole('checkbox', { name: 'Striped rows' }),
    ).toBeChecked();

    await userEvent.click(save);
    await waitFor(() =>
      expect(canvas.queryByRole('complementary')).not.toBeInTheDocument(),
    );
    await expect(rowCount(table)).toBe(20);
    await expect(
      getComputedStyle(canvas.getByRole('row', { name: '1002' }))
        .backgroundColor,
    ).not.toBe(TRANSPARENT);
  },
};
