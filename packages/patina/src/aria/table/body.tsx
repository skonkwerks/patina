import { isValidElement, use } from 'react';
import {
  TableBody as AriaTableBody,
  type TableBodyProps as AriaTableBodyProps,
} from 'react-aria-components';

import {
  EmptyState,
  type EmptyStateProps,
  emptyStateStyles,
} from '../../emptystate/index.js';
import { PendingStatus } from '../../spinner/index.js';
import { tableFrameStyles } from './component.js';
import { BodyStatusContext, type TableEmptyState } from './context.js';

export type TableBodyProps<T extends object> = Omit<
  AriaTableBodyProps<T>,
  'className' | 'renderEmptyState'
>;

/** Whether a table's empty state is the `EmptyState` control's props, rather than content of the app's own. */
const isEmptyStateProps = (
  emptyState: TableEmptyState,
): emptyState is EmptyStateProps =>
  typeof emptyState === 'object' &&
  !isValidElement(emptyState) &&
  'title' in emptyState;

/** The table's empty state as drawn: the `EmptyState` control, or the app's own content where it stands. */
const drawEmptyState = (emptyState: TableEmptyState) =>
  isEmptyStateProps(emptyState) ? (
    <EmptyState {...emptyState} />
  ) : (
    <div className={emptyStateStyles().root()}>{emptyState}</div>
  );

/** The table's rows. With none, it shows what the table was given: that they are being read, or its empty state. */
export const TableBody = <T extends object>(props: TableBodyProps<T>) => {
  const status = use(BodyStatusContext);
  return (
    <AriaTableBody
      {...props}
      // After a failed read the body has no empty state at all: React Aria then renders no empty row,
      // where an empty one would be an empty row header, and the failure above the table says why.
      renderEmptyState={
        status === null || status.hasFailed
          ? undefined
          : () =>
              status.pendingText === undefined ? (
                drawEmptyState(status.emptyState)
              ) : (
                <PendingStatus
                  text={status.pendingText}
                  className={tableFrameStyles().pending()}
                />
              )
      }
    />
  );
};
