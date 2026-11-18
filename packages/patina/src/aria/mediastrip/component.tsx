import { tv } from 'tailwind-variants';

import { panScrollTargetStyles } from '../../panscroll/index.js';
import { GridList, type GridListProps } from '../gridlist/index.js';

/**
 * The strip's grid: wrapping square tiles (`vertical`), or one row that scrolls sideways
 * (`horizontal`). An empty strip shows its empty state across the whole frame, not in the first
 * cell. Rows are sized by their tiles, so a strip bounded in height scrolls instead of squeezing
 * its rows. The horizontal row takes `PanScroll`'s target classes, so the mouse can drag it.
 */
export const mediaStripStyles = tv({
  base: 'grid gap-3 p-3 data-[empty]:block',
  variants: {
    orientation: {
      vertical: 'auto-rows-max grid-cols-[repeat(auto-fill,minmax(8rem,1fr))]',
      horizontal: [
        'scrollbar-visible auto-cols-[8rem] grid-flow-col overflow-x-auto',
        panScrollTargetStyles(),
      ],
    },
  },
  defaultVariants: { orientation: 'vertical' },
});

/** React Aria's orientation of a collection: the direction it scrolls. */
type Orientation = 'vertical' | 'horizontal';

/** Removes `K` from every member of a union, which `Omit` on the union itself does not. */
type OmitFromEach<T, K extends PropertyKey> = T extends unknown
  ? Omit<T, K>
  : never;

export type MediaStripProps<T extends object> = OmitFromEach<
  GridListProps<T>,
  'layout' | 'style' | 'shouldSelectOnPressUp'
> & {
  /**
   * React Aria's orientation: `vertical` (the default) lays the tiles out in rows that wrap and
   * scroll down; `horizontal` keeps them in one row that scrolls sideways, which `PanScroll` lets
   * the mouse drag. The arrow and page keys follow it.
   */
  orientation?: Orientation;
  /**
   * The tiles' width in CSS pixels, when the person chose one. Left out, wrapping tiles share the
   * row at 8rem or more each, and a row's tiles are 8rem wide.
   */
  tileWidth?: number;
};

/** The inline grid template for a chosen tile width, or none. */
const tileWidthStyle = (orientation: Orientation, tileWidth?: number) => {
  if (tileWidth === undefined) {
    return undefined;
  }
  return orientation === 'horizontal'
    ? { gridAutoColumns: `${tileWidth}px` }
    : {
        gridTemplateColumns: `repeat(auto-fill, minmax(0, min(100%, ${tileWidth}px)))`,
      };
};

/**
 * A collection of image tiles (`MediaStripItem`): the shared `GridList`, with its one Tab stop,
 * arrow keys in two dimensions, and its pending, failure, and empty states, laid out as wrapping
 * square tiles or as one row that scrolls sideways. The caller supplies selection, actions, and
 * any drop policy, as it would to a `GridList`. A tile selects when the pointer comes up on it
 * (`shouldSelectOnPressUp`), so a drag that `PanScroll` turns into a pan never changes the
 * selection; pass `ref` to drive the row with `PanScroll`. A strip whose tiles are reordered by
 * dragging (`useDragAndDrop`) gives each tile a `dragHandle` and is not wrapped by `PanScroll`.
 */
export const MediaStrip = <T extends object>({
  orientation = 'vertical',
  tileWidth,
  className,
  ...props
}: MediaStripProps<T>) => (
  <GridList
    {...props}
    layout='grid'
    orientation={orientation}
    shouldSelectOnPressUp
    style={tileWidthStyle(orientation, tileWidth)}
    className={mediaStripStyles({ orientation, className })}
  />
);
