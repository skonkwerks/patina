import { tv } from 'tailwind-variants';

import { fieldBoxStyles } from '../../internal/field.js';
import { focusRing } from '../../internal/focus.js';

export const multiSelectStyles = tv({
  slots: {
    summary: 'min-w-0 flex-1 truncate text-left',
    chevron: 'h-4 w-4 shrink-0',
    popover: 'w-72 p-2',
    dialog: 'flex flex-col gap-2 outline-0',
    clear: 'self-end',
  },
});

/** The trigger: the shared field box, as wide as its summary up to a limit. */
export const multiSelectTriggerStyles = tv({
  extend: fieldBoxStyles,
  base: 'hover:bg-surface-hover inline-flex h-8 max-w-64 cursor-pointer items-center gap-2 px-3',
});

/**
 * The list of options. It carries the shared focus ring for when it holds the focus itself, which
 * it does when the search matches nothing; otherwise the focus is on an option.
 */
export const multiSelectListBoxStyles = tv({
  extend: focusRing,
  base: 'max-h-64 overflow-auto rounded',
});
