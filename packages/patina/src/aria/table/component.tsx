import type { ReactNode } from 'react';
import {
  Table as AriaTable,
  type TableProps as AriaTableProps,
} from 'react-aria-components';
import { tv } from 'tailwind-variants';

import type { EmptyStateProps } from '../../emptystate/index.js';
import { focusRing } from '../../internal/focus.js';
import { BodyStatusContext } from './context.js';

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
