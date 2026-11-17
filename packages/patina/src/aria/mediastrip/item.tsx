import type { ReactNode } from 'react';
import {
  GridListItem as AriaGridListItem,
  type GridListItemProps as AriaGridListItemProps,
  Text,
} from 'react-aria-components';
import { tv } from 'tailwind-variants';

import { gridListTileStateStyles } from '../gridlist/index.ts';

export const mediaStripItemStyles = tv({
  extend: gridListTileStateStyles,
  base: 'group overflow-hidden text-xs',
  slots: {
    // The canvas shows where a picture's shape differs from the square frame.
    media: 'bg-canvas aspect-square w-full overflow-hidden',
    caption: 'flex min-w-0 items-center gap-1 px-2 py-1',
    startContent: 'flex shrink-0 items-center gap-1',
    title: 'min-w-0 flex-1 truncate text-sm font-medium',
    dragHandle: 'flex shrink-0 items-center',
    endContent: 'flex shrink-0 items-center gap-1',
    description: 'min-w-0 px-2 pb-2',
  },
  variants: {
    isCompact: {
      // A compact tile keeps its picture alone and lays the caption over its bottom edge: shown by
      // the pointer over the tile, by focus within it, and always on a touch screen, which has no
      // hover, so the caption is never reachable by hover alone. The caption keeps its whole line,
      // the drag handle included, so a compact reorderable tile's handle shows whenever the
      // caption does: under the pointer, when the keyboard reaches it, and always on touch.
      true: {
        caption:
          'bg-surface/90 absolute inset-x-0 bottom-0 opacity-0 group-focus-within:opacity-100 group-hover:opacity-100 pointer-coarse:opacity-100',
        // Hidden from sight, not from assistive technology: it still tells apart tiles that share a
        // title, whatever the strip's size.
        description: 'sr-only',
      },
    },
  },
});

export type MediaStripItemProps = Omit<
  AriaGridListItemProps,
  'children' | 'textValue' | 'className'
> & {
  /**
   * Before the title, at the start of the caption line and the caption's own height, such as the
   * tile's position in an ordered strip ("3").
   */
  startContent?: ReactNode;
  /** The tile's title: its caption, its typeahead text, and its accessible name. */
  title: string;
  /**
   * In a strip whose tiles are reordered by dragging (React Aria's `useDragAndDrop` on the strip),
   * the handle: an `IconButton` with `slot='drag'`, named for the tile, such as "Move Dawn". It
   * stands after the title and before the end marks, and gives the drag a keyboard path. A
   * reorderable strip is not wrapped by `PanScroll`: a drag there moves a tile, not the row. Its
   * pictures set `draggable={false}`, so the browser does not drag the raw image.
   */
  dragHandle?: ReactNode;
  /**
   * What fills the tile's square frame, sized by the frame: the picture, or what stands for it,
   * with any marks over its corners (such as `ImageOverlay`) placed by the caller.
   */
  media: ReactNode;
  /**
   * Marks at the end of the caption, such as an `IconMark` of the image's role. They are the
   * caption's own height, so every tile's caption keeps one height.
   */
  endContent?: ReactNode;
  /**
   * Under the caption, such as `InlineMetadata` of what the tile is. It is the tile's description
   * to assistive technology, which tells apart tiles that share a title. Every tile of a strip has
   * one or none has. A compact tile does not show it, but keeps it as its description.
   */
  description?: ReactNode;
  /**
   * A tile at a strip's small sizes: its picture alone, with the caption over its bottom edge while
   * the tile is hovered, holds the focus, or is on a touch screen.
   */
  isCompact?: boolean;
};

/**
 * One image tile in a `MediaStrip`: a square frame edge to edge, then the caption line (any start
 * content, the title cut to one line, the drag handle of a reorderable strip, and any marks at its
 * end), and an optional description under it, which React
 * Aria gives the tile as its description so a screen reader says it after the title. A tile lights
 * up under the pointer only where it has an action (its own `onAction`, or the strip's), as React
 * Aria decides.
 */
export const MediaStripItem = ({
  startContent,
  title,
  dragHandle,
  media,
  endContent,
  description,
  isCompact = false,
  ...rest
}: MediaStripItemProps) => {
  const styles = mediaStripItemStyles({ isCompact });
  return (
    <AriaGridListItem
      {...rest}
      textValue={title}
      className={(renderProps) =>
        mediaStripItemStyles({ ...renderProps, isCompact }).base()
      }
    >
      <div className={styles.media()}>{media}</div>
      <div className={styles.caption()}>
        {startContent && (
          <span className={styles.startContent()}>{startContent}</span>
        )}
        <span className={styles.title()}>{title}</span>
        {dragHandle && (
          <span className={styles.dragHandle()}>{dragHandle}</span>
        )}
        {endContent && (
          <span className={styles.endContent()}>{endContent}</span>
        )}
      </div>
      {description && (
        <Text
          slot='description'
          elementType='div'
          className={styles.description()}
        >
          {description}
        </Text>
      )}
    </AriaGridListItem>
  );
};
