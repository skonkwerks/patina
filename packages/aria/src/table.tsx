import { createContext, type ReactNode, use } from 'react';
import {
  Cell as AriaCell,
  type CellProps as AriaCellProps,
  Column as AriaColumn,
  type ColumnProps as AriaColumnProps,
  Row as AriaRow,
  type RowProps as AriaRowProps,
  Table as AriaTable,
  TableBody as AriaTableBody,
  type TableBodyProps as AriaTableBodyProps,
  TableHeader as AriaTableHeader,
  type TableHeaderProps as AriaTableHeaderProps,
  TableLoadMoreItem,
  type TableLoadMoreItemProps,
  type TableProps as AriaTableProps,
} from 'react-aria-components';
import { tv } from 'tailwind-variants';

import { EmptyState, type EmptyStateProps } from './emptystate.tsx';
import { focusRing } from './focus.ts';
import { ProgressBar } from './progressbar.tsx';
import { PendingStatus } from './spinner.tsx';

/** The frame around the table: where the error notice stands, the bordered box, the pending status. */
export const tableFrameStyles = tv({
  slots: {
    root: 'flex min-h-0 flex-col gap-3',
    frame:
      'bg-surface border-surface-border w-full overflow-clip rounded-lg border',
    pending: 'text-surface-foreground-muted p-4',
  },
});

/** The table element, which carries the shared focus ring. */
export const tableStyles = tv({
  extend: focusRing,
  base: 'text-surface-foreground w-full table-fixed border-collapse text-sm',
});

export const tableHeaderStyles = tv({
  base: 'bg-neutral text-neutral-foreground border-surface-border border-b',
});

/** Alignment shared by a column's header and its cells. */
const align = {
  start: 'text-left',
  end: 'text-right tabular-nums',
};

export const tableColumnStyles = tv({
  extend: focusRing,
  base: 'px-4 py-3 align-middle text-xs font-medium whitespace-nowrap',
  variants: {
    align,
    // Shares of the table's width, so that every column gives way together in a narrow place;
    // a column with no size shares what the sized ones leave.
    // `xs` is for a short value that never grows, such as a number of two digits.
    width: { xs: 'w-[8%]', sm: 'w-[12%]', md: 'w-[18%]', lg: 'w-[24%]' },
  },
  defaultVariants: { align: 'start' },
});

export const tableRowStyles = tv({
  extend: focusRing,
  // The line is drawn above each row but the first, and not below each but the last: a paged
  // table ends with React Aria's load-more row, so no row of the data is ever the last child.
  base: 'border-surface-border border-t outline-offset-[-2px] first:border-t-0',
  variants: {
    // The hover comes from React Aria, which a row has only where a press does something, so a
    // row that does nothing never lights up.
    isHovered: { true: 'bg-surface-hover cursor-pointer' },
  },
});

export const tableCellStyles = tv({
  extend: focusRing,
  base: 'px-4 py-3 align-middle outline-offset-[-2px]',
  variants: {
    align,
    allowsWrapping: { false: 'truncate' },
  },
  defaultVariants: { align: 'start', allowsWrapping: false },
});

export const tableLoadMoreStyles = tv({ base: 'p-3' });

type Align = 'start' | 'end';

/** What the body shows while it has no rows, which the table is given and its body draws. */
type BodyStatus = Readonly<{
  emptyState: EmptyStateProps;
  pendingText: string | undefined;
  hasFailed: boolean;
}>;

const BodyStatusContext = createContext<BodyStatus | null>(null);

export type TableProps = Omit<AriaTableProps, 'className'> & {
  /** What the table holds; every table has an accessible name. */
  'aria-label': string;
  /** What the table shows when its read succeeded and it has no rows: the `EmptyState` control's props. */
  emptyState: EmptyStateProps;
  /**
   * A failed read or refresh, shown above the table: the app renders the notice (such as a
   * `LoadFailure` with a retry), since an error notice is not a React Aria wrapper. With no rows the body stays
   * empty instead of claiming there is nothing; with rows already read they stay on screen.
   */
  error?: ReactNode;
} & (
    | { isPending?: false; pendingText?: undefined }
    | {
        /** While the first read is on its way, the body shows `pendingText` instead of the empty state. */
        isPending: boolean;
        pendingText: string;
      }
  );

/**
 * The project's table: records of one kind compared down their columns, one row each. React Aria
 * gives it one Tab stop with arrow keys between its rows and cells, and a row that is given an
 * action is pressed as a whole (`onRowAction`). The table is always rendered; reading and empty
 * are states of its body, and a failed read shows above it, so its frame never changes. Its
 * columns share the table's width, a sized column taking its size and the others the rest, and
 * a cell's text is cut where its column ends: the table never becomes wider than its place, and
 * its frame is no scroller, so the end of a paged table is seen by the page that scrolls it.
 */
export const Table = ({
  emptyState,
  error,
  isPending = false,
  pendingText,
  children,
  ...rest
}: TableProps) => {
  const frame = tableFrameStyles();
  return (
    <div className={frame.root()}>
      {error}
      <div className={frame.frame()}>
        <AriaTable
          {...rest}
          className={(renderProps) => tableStyles(renderProps)}
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
      </div>
    </div>
  );
};

export type TableHeaderProps<T extends object> = Omit<
  AriaTableHeaderProps<T>,
  'className'
>;

export const TableHeader = <T extends object>(props: TableHeaderProps<T>) => (
  <AriaTableHeader {...props} className={tableHeaderStyles()} />
);

export type ColumnProps = Omit<
  AriaColumnProps,
  'className' | 'children' | 'width' | 'minWidth' | 'maxWidth' | 'defaultWidth'
> & {
  children: string;
  /** `end` for a column of numbers, so their digits line up. */
  align?: Align;
  /** How much of the table's width the column takes. Left out, it shares what the sized columns leave. */
  width?: 'xs' | 'sm' | 'md' | 'lg';
};

export const Column = ({ children, align, width, ...rest }: ColumnProps) => (
  <AriaColumn
    {...rest}
    className={(renderProps) =>
      tableColumnStyles({ ...renderProps, align, width })
    }
  >
    {children}
  </AriaColumn>
);

export type TableBodyProps<T extends object> = Omit<
  AriaTableBodyProps<T>,
  'className' | 'renderEmptyState'
>;

/** The table's rows. With none, it shows what the table was given: that they are being read, or its empty state. */
export const TableBody = <T extends object>(props: TableBodyProps<T>) => {
  const status = use(BodyStatusContext);
  return (
    <AriaTableBody
      {...props}
      renderEmptyState={() => {
        if (status === null || status.hasFailed) {
          return null;
        }
        return status.pendingText === undefined ? (
          <EmptyState {...status.emptyState} />
        ) : (
          <PendingStatus
            text={status.pendingText}
            className={tableFrameStyles().pending()}
          />
        );
      }}
    />
  );
};

export type RowProps<T extends object> = Omit<AriaRowProps<T>, 'className'>;

export const Row = <T extends object>(props: RowProps<T>) => (
  <AriaRow
    {...props}
    className={(renderProps) => tableRowStyles(renderProps)}
  />
);

export type CellProps = Omit<AriaCellProps, 'className'> & {
  /** `end` for a number, so its digits line up with the column's. */
  align?: Align;
  /**
   * For a cell that holds more than a line of text, such as chips: its content wraps inside the
   * column. Left out, the cell is one line, cut where the column ends.
   */
  allowsWrapping?: boolean;
};

export const Cell = ({ align, allowsWrapping = false, ...rest }: CellProps) => (
  <AriaCell
    {...rest}
    className={(renderProps) =>
      tableCellStyles({ ...renderProps, align, allowsWrapping })
    }
  />
);

export type TableLoadMoreProps = Omit<
  TableLoadMoreItemProps,
  'children' | 'className'
> & {
  /** The accessible name of the progress shown while the next page is read, such as the vocabulary's word for loading. */
  pendingText: string;
};

/**
 * The end of a paged `Table`: React Aria calls `onLoadMore` as this end scrolls into view and,
 * while `isLoading`, shows an indeterminate progress bar named `pendingText`. Place it after the
 * rows, inside the body. Pass `onLoadMore` only when a next page may be read, so nothing more is
 * requested.
 */
export const TableLoadMore = ({ pendingText, ...rest }: TableLoadMoreProps) => (
  <TableLoadMoreItem {...rest} className={tableLoadMoreStyles()}>
    <ProgressBar isIndeterminate aria-label={pendingText} />
  </TableLoadMoreItem>
);
