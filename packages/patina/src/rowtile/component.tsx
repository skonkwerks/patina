import type { ReactNode } from 'react';

import { rowTileStyles } from './styles.js';

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
