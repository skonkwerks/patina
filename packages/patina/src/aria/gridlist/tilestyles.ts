import { tv } from 'tailwind-variants';

import { DISABLED } from '../../internal/disabled.ts';
import { focusRing } from '../../internal/focus.ts';

/**
 * The states every tile of a grid layout draws, a `GridListTile` and any composite tile alike:
 * selected, hovered, dragged, and disabled.
 */
export const gridListTileStateStyles = tv({
  extend: focusRing,
  base: 'bg-surface text-surface-foreground relative flex min-w-0 cursor-default flex-col rounded-lg border -outline-offset-2 select-none',
  variants: {
    isSelected: {
      false: 'border-surface-border',
      // The selected tile's border is wider as well as colored, so selection never rests on color alone.
      true: 'border-primary bg-primary/10 ring-primary ring-1',
    },
    // Only a tile React Aria lets the pointer act on lights up, so a locked tile never invites a press.
    isHovered: { true: '' },
    // The tile being dragged fades, so where it will land reads against where it was.
    isDragging: { true: 'opacity-40' },
    isDisabled: { true: [DISABLED, 'forced-colors:text-[GrayText]'] },
  },
  // A selected tile under the pointer keeps a selected fill, as a list's row does; the two fills are
  // the ones an app checks the tile's text contrast on.
  compoundVariants: [
    { isSelected: false, isHovered: true, class: 'bg-surface-hover' },
    { isSelected: true, isHovered: true, class: 'bg-primary/12' },
  ],
});
