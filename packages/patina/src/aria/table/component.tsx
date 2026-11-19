import { type ReactNode, useCallback, useRef, useState } from 'react';
import {
  ResizableTableContainer,
  type ResizableTableContainerProps,
  Table as AriaTable,
  type TableProps as AriaTableProps,
} from 'react-aria-components';
import { tv } from 'tailwind-variants';

import { focusRing } from '../../internal/focus.js';
import {
  BodyStatusContext,
  ColumnResizingContext,
  type TableEmptyState,
  TableLookContext,
} from './context.js';
import { LoadMoreBar, type TableLoadMore } from './loadmore.js';
import { TableScrollbar } from './scrollbar.js';

/**
 * The frame around the table: the tools row above it, where the error notice stands, the bordered
 * box, the scroller inside it, the pending status.
 */
export const tableFrameStyles = tv({
  slots: {
    root: 'flex min-h-0 flex-col gap-3',
    // Cloudscape's tools row: the filter at the start, growing to fill the row (from its content's
    // width where the browser takes `fit-content` as a flex basis, as Cloudscape guards it); the
    // pagination and the preferences' control at the end. Where the row is narrower than
    // Cloudscape's small breakpoint (688px), the filter takes a row of its own and the end wraps
    // under it.
    tools: '@container flex flex-wrap items-end gap-x-5 gap-y-2',
    filter:
      'max-w-full flex-[1_1_auto] supports-[flex-basis:fit-content]:flex-[1_1_fit-content] @max-[43rem]:basis-full',
    // The row's end: the pagination, then the preferences' control, with a line between them.
    end: 'ms-auto flex items-center',
    pagination: 'flex',
    preferences:
      'not-first:border-surface-border flex not-first:ms-2 not-first:border-s not-first:ps-2',
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
  /**
   * What the table shows when its read succeeded and it has no rows: the `EmptyState` control's
   * props, or any content, drawn centered where the empty state stands.
   */
  emptyState: TableEmptyState;
  /**
   * The control that opens the table's preferences, such as Patina's `CollectionPreferences`: at
   * the end of the row above the table, after the pagination, as Cloudscape's.
   */
  preferences?: ReactNode;
  /**
   * Whether a cell wraps its text inside its column, as Cloudscape's "wrap lines"; a `Cell`'s own
   * `allowsWrapping` wins. Left out, every cell is one line, cut where its column ends.
   */
  allowsWrapping?: boolean;
  /** Every other row on a faint fill, so a row is easier to follow across, as Cloudscape's. */
  isStriped?: boolean;
  /**
   * The rows stand closer together, with less room above and below each row's text and each
   * heading, so more rows are in view, as Cloudscape's compact mode.
   */
  isCompact?: boolean;
  /**
   * A failed read or refresh, shown above the table: a node, because a wrapper cannot import a
   * composite, so the app passes the notice, such as Patina's `LoadFailure`. With no rows the body
   * stays empty instead of claiming there is nothing; with rows already read they stay on screen.
   */
  error?: ReactNode;
} & (
    | {
        /**
         * The search box over the rows, such as Patina's `TextFilter`: at the start of the row above
         * the table, growing to fill it, as Cloudscape's. It searches every row the app holds.
         */
        filter?: ReactNode;
        /**
         * The pages' control, such as Patina's `Pagination`: at the end of the row above the table,
         * as Cloudscape's. It pages every row the app holds.
         */
        pagination?: ReactNode;
        loadMore?: undefined;
      }
    | {
        /**
         * For a paged table while a next page may be read: the bar under the rows with its button,
         * as Cloudscape's tables read more. Left out once every page is read.
         *
         * A table that reads its rows a page at a time holds only some of them, so it takes neither
         * `filter` nor `pagination`: a search of the rows read so far would say nothing matches
         * while matches wait on pages not read yet.
         */
        loadMore?: TableLoadMore;
        filter?: undefined;
        pagination?: undefined;
      }
  ) &
  (
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
 * and `maxWidth`), and a cell's text stays on one line unless the table or the cell allows
 * wrapping (`allowsWrapping`, the cell's own winning). When the
 * columns are wider than the frame, the table scrolls sideways inside it, and its scrollbar sticks
 * to the bottom of the window while the table runs past it, as Cloudscape's does, so the person
 * scrolls sideways without scrolling down to the last row. With
 * `allowsColumnResizing`, each heading has a resizer instead, and a column without a width shares
 * what the others leave, so the last one fills the frame.
 *
 * A paged table reads its next page from the button in the bar under its rows (`loadMore`), never
 * on its own as its end scrolls into view.
 *
 * A table that holds every row can take a search box (`filter`) and a pages' control (`pagination`)
 * in the row above it, as Cloudscape's: the filter at the start, the pagination at the end. Both
 * work on the rows in the browser; a paged table takes neither. Any table can take the control
 * that opens its preferences (`preferences`), at the row's end, after the pagination. The looks
 * the preferences set are the table's: every other row on a faint fill (`isStriped`), the rows
 * closer together (`isCompact`), and its cells wrapping their text (`allowsWrapping`).
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
  filter,
  pagination,
  preferences,
  allowsWrapping = false,
  isStriped = false,
  isCompact = false,
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
      <TableLookContext value={{ allowsWrapping, isStriped, isCompact }}>
        <BodyStatusContext
          value={{
            emptyState,
            // The props give the text whenever the table is pending; destructuring loses that
            // pairing.
            pendingText: isPending ? pendingText : undefined,
            hasFailed: Boolean(error),
          }}
        >
          {children}
        </BodyStatusContext>
      </TableLookContext>
    </AriaTable>
  );
  const hasTools =
    filter !== undefined ||
    pagination !== undefined ||
    preferences !== undefined;
  const hasEnd = pagination !== undefined || preferences !== undefined;
  return (
    <div className={frame.root()}>
      {hasTools && (
        <div className={frame.tools()}>
          {filter !== undefined && (
            <div className={frame.filter()}>{filter}</div>
          )}
          {hasEnd && (
            <div className={frame.end()}>
              {pagination !== undefined && (
                <div className={frame.pagination()}>{pagination}</div>
              )}
              {preferences !== undefined && (
                <div className={frame.preferences()}>{preferences}</div>
              )}
            </div>
          )}
        </div>
      )}
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
