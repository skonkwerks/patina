import type { ReactNode } from 'react';
import {
  GridListItem as AriaGridListItem,
  type GridListItemProps as AriaGridListItemProps,
} from 'react-aria-components';
import { tv } from 'tailwind-variants';

import { gridListTileStateStyles } from './tilestyles.js';

export const gridListTileStyles = tv({
  extend: gridListTileStateStyles,
  base: 'gap-2 p-3 text-sm',
});

export type GridListTileProps = Omit<
  AriaGridListItemProps,
  'children' | 'textValue' | 'className'
> & {
  /** The tile's name: its typeahead text and accessible name. */
  textValue: string;
  /** What the tile shows: any layout, laid out top to bottom. */
  children: ReactNode;
  /** Layout for the tile itself, such as its width; the wrapper owns every state style. */
  className?: string;
};

/**
 * One unit of a `GridList` laid out as a grid (`layout='grid'`): a bordered tile whose content the
 * caller lays out. An image tile with a caption is a `MediaStripItem`; this is for any other
 * unit, such as a GPU or an evaluation image. `style` passes through, so a tile can be placed in a CSS
 * grid by its own position.
 */
export const GridListTile = ({
  children,
  className,
  ...rest
}: GridListTileProps) => (
  <AriaGridListItem
    {...rest}
    className={(renderProps) =>
      gridListTileStyles({ ...renderProps, className })
    }
  >
    {children}
  </AriaGridListItem>
);
