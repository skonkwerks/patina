import {
  GridListLoadMoreItem,
  type GridListLoadMoreItemProps,
} from 'react-aria-components';
import { tv } from 'tailwind-variants';

import { ProgressBar } from '../progressbar/index.ts';

export const gridListLoadMoreStyles = tv({ base: 'col-span-full p-3' });

export type GridListLoadMoreProps = Omit<
  GridListLoadMoreItemProps,
  'children'
> & {
  /** The accessible name of the progress shown while the next page is read, such as the vocabulary's word for loading. */
  pendingText: string;
};

/**
 * The end of a paged `GridList`: React Aria calls `onLoadMore` as this end scrolls into view and,
 * while `isLoading`, shows an indeterminate progress bar named `pendingText`. Place it after the
 * items, inside the list. Pass `onLoadMore` only when a next page may be read, so nothing more is
 * requested; every other React Aria prop passes through.
 */
export const GridListLoadMore = ({
  pendingText,
  className,
  ...rest
}: GridListLoadMoreProps) => (
  <GridListLoadMoreItem
    {...rest}
    className={gridListLoadMoreStyles({ className })}
  >
    <ProgressBar isIndeterminate aria-label={pendingText} />
  </GridListLoadMoreItem>
);
