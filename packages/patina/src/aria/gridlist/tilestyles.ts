import { tv } from 'tailwind-variants';

import { itemStateStyles } from '../../internal/itemstate.ts';
import {
  gridListDropTargetOutline,
  gridListTileDropLine,
} from './dropindicator.tsx';

/**
 * The states every tile of a grid layout draws, a `GridListTile` and any composite tile alike:
 * selected, hovered, dragged, and disabled, and the insertion line of a reorder.
 */
export const gridListTileStateStyles = tv({
  // The shared item states (`internal/itemstate.ts`): the focus ring, the hover and selected fills,
  // and the disabled look. A tile's mark of selection that is not color alone is its own border.
  extend: itemStateStyles,
  base: [
    'bg-surface text-surface-foreground relative flex min-w-0 cursor-default flex-col rounded-lg border select-none',
    // Where a reordered tile will land: a line at the edge of the tile beside the drop indicator.
    gridListTileDropLine,
  ],
  variants: {
    // The tile being dragged fades, so where it will land reads against where it was.
    isDragging: { true: 'opacity-40' },
    // A drop onto the tile draws `gridListDropTargetOutline` (dropindicator.tsx). The primary on the
    // surface is 4.9:1 in Storybook's light theme, and 4.3:1 on the selected fill. A drop between
    // tiles draws the insertion line instead.
    // Its classes are a compound variant below, so they come after the focus ring's `outline-0`;
    // while a drop is over a focused item, the dashed outline stands in for the focus ring.
    isDropTarget: { true: '', false: '' },
  },
  compoundVariants: [
    { isSelected: false, class: 'border-surface-border' },
    // The selected tile's border is wider as well as colored, so selection never rests on color
    // alone. (Compound variants, since an extending style that defines `isSelected` again loses its
    // boolean type in tailwind-variants 3.3.1.)
    { isSelected: true, class: 'border-primary ring-primary ring-1' },
    {
      isDropTarget: true,
      class: gridListDropTargetOutline,
    },
  ],
});
