import { tv } from 'tailwind-variants';

import { DISABLED } from '../../internal/disabled.ts';

/**
 * The zone's frame is dashed while it takes files and solid while it does not, as a grid list's
 * file drop is, at the same width either way so nothing moves. Disabled, its icon is drawn disabled
 * and its button draws its own disabled state; its words stay readable, since they still say what
 * the zone is for.
 */
export const dropZoneStyles = tv({
  slots: {
    root: 'border-surface-border bg-surface flex flex-col items-center justify-center gap-2 rounded-lg border-2 p-6 text-center transition-colors',
    icon: 'text-surface-foreground-muted h-6 w-6',
    title: 'text-surface-foreground text-sm font-medium',
    description: 'text-surface-foreground-muted text-xs',
  },
  variants: {
    isDropTarget: { true: { root: 'border-primary bg-primary/10' } },
    isDisabled: {
      true: { icon: DISABLED },
      false: { root: 'border-dashed' },
    },
  },
});
