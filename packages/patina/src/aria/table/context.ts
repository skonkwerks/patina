import { createContext, type ReactNode } from 'react';

import type { EmptyStateProps } from '../../emptystate/index.js';

/**
 * A table's empty state: the `EmptyState` control's props, or content of the app's own. Never
 * nothing (`undefined`, `null` or a boolean), which would draw a blank box where the empty state
 * says what is empty.
 */
export type TableEmptyState =
  EmptyStateProps | Exclude<ReactNode, boolean | null | undefined>;

/** What the body shows while it has no rows, which the table is given and its body draws. */
type BodyStatus = Readonly<{
  emptyState: TableEmptyState;
  pendingText: string | undefined;
  hasFailed: boolean;
}>;

export const BodyStatusContext = createContext<BodyStatus | null>(null);

/** How the table is drawn, which its rows, cells and headings read. */
type TableLook = Readonly<{
  /** Whether a cell wraps its text unless it says otherwise. */
  allowsWrapping: boolean;
  /** Whether every other row is drawn on a faint fill. */
  isStriped: boolean;
  /** Whether the rows stand closer together, with less room above and below their text. */
  isCompact: boolean;
}>;

export const TableLookContext = createContext<TableLook>({
  allowsWrapping: false,
  isStriped: false,
  isCompact: false,
});

/** Whether the table's columns can be resized, which its columns read to draw their resizers. */
export const ColumnResizingContext = createContext(false);
