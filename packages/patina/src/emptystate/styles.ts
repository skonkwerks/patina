import { tv } from 'tailwind-variants';

export const emptyStateStyles = tv({
  slots: {
    root: 'flex flex-col items-center gap-2 p-8 text-center',
    title: 'text-surface-foreground text-sm font-medium',
    description: 'text-surface-foreground-muted text-sm',
    actions: 'mt-2 flex gap-2',
  },
});
