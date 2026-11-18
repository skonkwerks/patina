import { use } from 'react';
import {
  TableBody as AriaTableBody,
  type TableBodyProps as AriaTableBodyProps,
} from 'react-aria-components';

import { EmptyState } from '../../emptystate/index.js';
import { PendingStatus } from '../../spinner/index.js';
import { tableFrameStyles } from './component.js';
import { BodyStatusContext } from './context.js';

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
      // After a failed read the body has no empty state at all: React Aria then renders no empty row,
      // where an empty one would be an empty row header, and the failure above the table says why.
      renderEmptyState={
        status === null || status.hasFailed
          ? undefined
          : () =>
              status.pendingText === undefined ? (
                <EmptyState {...status.emptyState} />
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
