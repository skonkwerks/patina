import { tv } from 'tailwind-variants';

import { focusRing } from '../../internal/focus.js';

/**
 * The pagination's look, as Cloudscape's: the arrows and the page numbers in one row, the current
 * page in bold in the text's own color and the others muted, an ellipsis for the pages left out.
 */
export const paginationStyles = tv({
  slots: {
    root: 'flex items-center gap-0.5 text-sm',
    gap: 'text-surface-foreground-muted px-1 select-none',
  },
});

/** A page's button: as tall as an `IconButton`, as wide as its number. */
export const paginationPageStyles = tv({
  extend: focusRing,
  base: 'text-surface-foreground-muted hover:bg-surface-hover hover:text-surface-foreground inline-flex h-8 min-w-8 cursor-pointer items-center justify-center rounded-md px-1.5 tabular-nums transition-colors select-none',
  variants: {
    isCurrent: { true: 'text-surface-foreground font-bold' },
  },
});
