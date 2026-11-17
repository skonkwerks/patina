import {
  TableLoadMoreItem,
  type TableLoadMoreItemProps,
} from 'react-aria-components';
import { tv } from 'tailwind-variants';

import { ProgressBar } from '../progressbar/index.ts';

export const tableLoadMoreStyles = tv({ base: 'p-3' });

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
