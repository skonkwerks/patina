import { type ReactNode, useCallback, useRef, useState } from 'react';
import {
  ResizableTableContainer,
  type ResizableTableContainerProps,
  Table as AriaTable,
  type TableProps as AriaTableProps,
} from 'react-aria-components';
import { tv } from 'tailwind-variants';

import type { EmptyStateProps } from '../../emptystate/index.js';
import { focusRing } from '../../internal/focus.js';
import { BodyStatusContext, ColumnResizingContext } from './context.js';
import { LoadMoreBar, type TableLoadMore } from './loadmore.js';
import { TableScrollbar } from './scrollbar.js';

/** The frame around the table: where the error notice stands, the bordered box, the scroller inside it, the pending status. */
export const tableFrameStyles = tv({
  slots: {
    root: 'flex min-h-0 flex-col gap-3',
    frame:
      'bg-surface border-surface-border w-full overflow-clip rounded-lg border',
    // The table scrolls sideways inside its frame when its columns are wider than the frame, as
    // Cloudscape's does. A scroller is the scroll root React Aria's load-more row would watch, and
    // as it grows with the rows, that row would always count as in view and read every page by
    // itself; so a paged table reads its next page from the bar's button instead. Its own scrollbar
    // is hidden: the table's sticky scrollbar under it takes its place (`tableScrollbarStyles`).
    scroller:
      '[scrollbar-width:none] overflow-x-auto [&::-webkit-scrollbar]:hidden',
    pending: 'text-surface-foreground-muted p-4',
  },
});

/** The table element, which carries the shared focus ring. */
export const tableStyles = tv({
  extend: focusRing,
  base: 'text-surface-foreground w-full border-collapse text-sm',
  variants: {
    // A resizable table lays its columns out at the widths React Aria gives them; any other table
    // sizes each column to its content within the sizes the column sets, as Cloudscape's does.
    allowsColumnResizing: { true: 'table-fixed', false: 'table-auto' },
  },
});

export type TableProps = Omit<AriaTableProps, 'className'> & {
  /** What the table holds; every table has an accessible name. */
  'aria-label': string;
  /** What the table shows when its read succeeded and it has no rows: the `EmptyState` control's props. */
  emptyState: EmptyStateProps;
  /**
   * A failed read or refresh, shown above the table: a node, because a wrapper cannot import a
   * composite, so the app passes the notice, such as `LoadFailure` from
   * `@skonkwerks/patina/loadstatus`. With no rows the body stays
   * empty instead of claiming there is nothing; with rows already read they stay on screen.
   */
  error?: ReactNode;
  /**
   * For a paged table while a next page may be read: the bar under the rows with its button, as
   * Cloudscape's tables read more. Left out once every page is read.
   */
  loadMore?: TableLoadMore;
} & (
    | { isPending?: false; pendingText?: undefined }
    | {
        /** While the first read is on its way, the body shows `pendingText` instead of the empty state. */
        isPending: boolean;
        pendingText: string;
      }
  ) &
  (
    | {
        allowsColumnResizing?: false;
        onResizeStart?: undefined;
        onResize?: undefined;
        onResizeEnd?: undefined;
      }
    | ({
        /**
         * The columns can be resized: each heading ends with a resizer to drag, or to press Enter
         * on and move with the arrow keys. Opt in for the tables that need it, as Cloudscape does.
         */
        allowsColumnResizing: true;
      } & Pick<
        ResizableTableContainerProps,
        // React Aria's: each gives every column's width. `onResize` with each column's `width` holds
        // the widths in the app (controlled); `onResizeEnd` is where the app stores them, which is
        // the app's to do. Without either, React Aria keeps the widths while the table is mounted.
        'onResizeStart' | 'onResize' | 'onResizeEnd'
      >)
  );

/**
 * The project's table: records of one kind compared down their columns, one row each, following
 * Cloudscape's table. React Aria gives it one Tab stop with arrow keys between its rows and cells,
 * and a row that is given an action is pressed as a whole (`onRowAction`). The table is always
 * rendered; reading and empty are states of its body, and a failed read shows above it, so its
 * frame never changes.
 *
 * Each column is as wide as its content within the sizes it sets (`Column`'s `width`, `minWidth`
 * and `maxWidth`), and a cell's text stays on one line unless the cell allows wrapping. When the
 * columns are wider than the frame, the table scrolls sideways inside it, and its scrollbar sticks
 * to the bottom of the window while the table runs past it, as Cloudscape's does, so the person
 * scrolls sideways without scrolling down to the last row. With
 * `allowsColumnResizing`, each heading has a resizer instead, and a column without a width shares
 * what the others leave, so the last one fills the frame.
 *
 * A paged table reads its next page from the button in the bar under its rows (`loadMore`), never
 * on its own as its end scrolls into view.
 *
 * A table sorts by one column at a time, as Cloudscape's does: a column with `allowsSorting` is
 * pressed to sort by it, `sortDescriptor` (React Aria's) says which column and in which direction,
 * and `onSortChange` gives the new one. The app sorts the rows; the table only draws the sort.
 *
 * With a `selectionMode`, a selected row has the shared row's tint and start bar. Under the default
 * `selectionBehavior='toggle'`, the rows lead with a selection column: checkboxes, and a select-all
 * in the header, when several rows can be selected (`multiple`); a round mark, as a radio's, when
 * one can (`single`). Under `selectionBehavior='replace'` a press replaces the selection, and there
 * is no column.
 */
export const Table = ({
  emptyState,
  error,
  loadMore,
  isPending = false,
  pendingText,
  allowsColumnResizing = false,
  onResizeStart,
  onResize,
  onResizeEnd,
  children,
  ...rest
}: TableProps) => {
  const frame = tableFrameStyles();
  const tableRef = useRef<HTMLTableElement>(null);
  // The table and its scroller as elements, for the scrollbar, which watches them: switching
  // `allowsColumnResizing` replaces both.
  const [tableElement, setTableElement] = useState<HTMLTableElement | null>(
    null,
  );
  const [scroller, setScroller] = useState<HTMLDivElement | null>(null);
  // One callback ref sets both: `tableRef` for `LoadMoreBar`, which reads the table after a commit,
  // from its cleanup, and needs the element then rather than one a render captured; and the state
  // for the scrollbar. Memoized, so React does not call a new ref with null and then the element on
  // every render, setting the state each time.
  const setTable = useCallback((element: HTMLTableElement | null) => {
    tableRef.current = element;
    setTableElement(element);
  }, []);
  const table = (
    <AriaTable
      {...rest}
      ref={setTable}
      className={(renderProps) =>
        tableStyles({ ...renderProps, allowsColumnResizing })
      }
    >
      <BodyStatusContext
        value={{
          emptyState,
          // The props give the text whenever the table is pending; destructuring loses that pairing.
          pendingText: isPending ? pendingText : undefined,
          hasFailed: Boolean(error),
        }}
      >
        {children}
      </BodyStatusContext>
    </AriaTable>
  );
  return (
    <div className={frame.root()}>
      {error}
      <div className={frame.frame()}>
        <ColumnResizingContext value={allowsColumnResizing}>
          {allowsColumnResizing ? (
            <ResizableTableContainer
              ref={setScroller}
              onResizeStart={onResizeStart}
              onResize={onResize}
              onResizeEnd={onResizeEnd}
              className={frame.scroller()}
            >
              {table}
            </ResizableTableContainer>
          ) : (
            <div ref={setScroller} className={frame.scroller()}>
              {table}
            </div>
          )}
        </ColumnResizingContext>
        <TableScrollbar scroller={scroller} table={tableElement} />
        {loadMore && <LoadMoreBar loadMore={loadMore} tableRef={tableRef} />}
      </div>
    </div>
  );
};
