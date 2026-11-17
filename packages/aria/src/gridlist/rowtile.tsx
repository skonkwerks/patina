import type { ReactNode } from 'react';
import { tv } from 'tailwind-variants';

export const rowTileStyles = tv({
  base: 'flex h-10 w-10 shrink-0 items-center justify-center',
  variants: {
    kind: {
      // A picture runs edge to edge and is cut to the tile's rounded corners.
      picture: 'overflow-hidden rounded-md',
      // A mark stands on the row's own background, with room around it, so a mark drawn to the
      // edge of its artwork is no larger to the eye than a picture.
      mark: 'text-surface-foreground-muted p-1.5',
    },
  },
});

export type RowTileProps = {
  /**
   * What the tile holds. A `picture` (a poster, a thumbnail) fills the tile. A `mark` (a logo, an
   * icon) stands inside it, a little smaller, with nothing drawn behind it.
   */
  kind: 'picture' | 'mark';
  /** The picture or the mark, which takes all the room the tile gives it (`h-full w-full`). */
  children: ReactNode;
};

/**
 * The one tile before a row's name, wherever a row of a list shows a picture or a mark of its
 * unit: one size for every list, so no caller sizes one, and the names of a list stand in one
 * column. A list in which one row has a tile has one in every row; a unit with no picture of its
 * own shows a mark that stands for it. What the tile holds is decoration: the row's name and
 * chips say what the unit is.
 */
export const RowTile = ({ kind, children }: RowTileProps) => (
  <div className={rowTileStyles({ kind })}>{children}</div>
);
