import { tv } from 'tailwind-variants';

export const inlineMetadataStyles = tv({
  slots: {
    // One line: a row keeps its height whatever its values say, so values that do not fit are cut.
    root: 'text-surface-foreground-muted flex min-w-0 items-center gap-x-2 overflow-hidden whitespace-nowrap',
    item: 'flex min-w-0 shrink items-center gap-x-2',
    value: 'min-w-0 truncate',
  },
  variants: {
    size: { sm: { root: 'text-xs' }, md: { root: 'text-sm' } },
  },
  defaultVariants: { size: 'sm' },
});
