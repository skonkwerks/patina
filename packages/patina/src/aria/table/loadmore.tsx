import { type RefObject, useLayoutEffect, useRef } from 'react';
import { tv } from 'tailwind-variants';

import { Button } from '../button/index.js';

/** The bar under a paged table's rows, inside its frame, with its button in the middle. */
export const tableLoadMoreStyles = tv({
  base: 'border-surface-border flex justify-center border-t p-2',
});

/** A paged table's bar, which reads the next page when its button is pressed. */
export type TableLoadMore = Readonly<{
  /** The button's text, the app's words, such as "Load more invoices". */
  text: string;
  /** While the next page is read: the button shows its spinner and ignores presses. */
  isPending: boolean;
  /** Reads the next page. */
  onLoadMore: () => void;
}>;

/** The rows of the table's body: the rows the app's pages read. */
const bodyRows = (table: HTMLTableElement | null) =>
  Array.from(
    table?.querySelectorAll<HTMLElement>('tbody > [role="row"]') ?? [],
  );

type LoadMoreBarProps = Readonly<{
  loadMore: TableLoadMore;
  /** The table, whose rows the focus moves to when the bar goes. */
  tableRef: RefObject<HTMLTableElement | null>;
}>;

/**
 * The bar of a paged table. It goes once every page is read; if its button had the focus then, the
 * focus moves to the first row the last page read, where reading goes on, and is never dropped on
 * the page.
 */
export const LoadMoreBar = ({ loadMore, tableRef }: LoadMoreBarProps) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  // How many rows the body had when the button was last pressed: the index of the next page's first.
  const rowsBeforeRef = useRef(0);
  useLayoutEffect(
    () => () => {
      const button = buttonRef.current;
      // Runs as the bar is removed, before its button leaves the page, while it may still hold the focus.
      if (button === null || button.ownerDocument.activeElement !== button) {
        return;
      }
      const firstNew = rowsBeforeRef.current;
      // After the commit, once the last page's rows are in the body.
      queueMicrotask(() => {
        const rows = bodyRows(tableRef.current);
        (rows[firstNew] ?? rows.at(-1))?.focus();
      });
    },
    [tableRef],
  );
  return (
    <div className={tableLoadMoreStyles()}>
      <Button
        ref={buttonRef}
        variant='ghost'
        isPending={loadMore.isPending}
        onPress={() => {
          rowsBeforeRef.current = bodyRows(tableRef.current).length;
          loadMore.onLoadMore();
        }}
      >
        {loadMore.text}
      </Button>
    </div>
  );
};
