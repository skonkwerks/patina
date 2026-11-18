import { tv } from 'tailwind-variants';

import { DISABLED } from './disabled.ts';
import { focusRing } from './focus.ts';

/**
 * The states of an item in a collection on a surface, defined once for a `GridList`'s rows and
 * tiles and a `Tree`'s rows: the focus ring inside its edge, a hover fill, a selected fill, and the
 * disabled look. The selected fills are light enough for the muted text and the chips an item holds
 * to keep their contrast on them; an app checks its text contrast on these two fills.
 *
 * A fill is never the only sign of selection (`ux/accessibility.md`: color is never the only
 * signal): a row adds `rowStateStyles`' bar, and a tile its wider primary border.
 */
export const itemStateStyles = tv({
  extend: focusRing,
  base: '-outline-offset-2',
  variants: {
    isSelected: { true: 'bg-primary/10', false: '' },
    // React Aria reports the hover only where a press does something (selects or acts), so an item
    // that does nothing never lights up.
    isHovered: { true: '', false: '' },
    isDisabled: { true: [DISABLED, 'forced-colors:text-[GrayText]'] },
  },
  compoundVariants: [
    { isSelected: false, isHovered: true, class: 'bg-surface-hover' },
    { isSelected: true, isHovered: true, class: 'bg-primary/12' },
  ],
});

/**
 * A row's states: the item states, and a selected row's mark that is not color alone, a 2px primary
 * bar at its start edge (mirrored in a right-to-left page), as the navigation's current item has an
 * edge marker. Every row keeps the 2px edge, transparent while it is not selected, so selecting a
 * row never moves its content. A row with its own border color sets it in its base; the bar's
 * colors are compound variants, which come after the base and so win on the start edge.
 */
export const rowStateStyles = tv({
  extend: itemStateStyles,
  base: 'border-s-2',
  // Compound variants rather than a second `isSelected`: an extending style that defines a boolean
  // variant again loses its boolean type in tailwind-variants 3.3.1.
  compoundVariants: [
    {
      isSelected: true,
      class: 'border-s-primary forced-colors:border-s-[Highlight]',
    },
    { isSelected: false, class: 'border-s-transparent' },
  ],
});
