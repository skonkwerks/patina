import { tv } from 'tailwind-variants';

export const gridListRowStyles = tv({
  slots: {
    root: 'flex min-w-0 flex-1 flex-col gap-2',
    main: 'flex min-h-8 min-w-0 items-center gap-3',
    text: 'flex min-w-0 flex-1 flex-col gap-1',
    // Every line of a row is one line, so a row keeps its height whatever its data says.
    heading: 'flex min-w-0 items-center gap-2',
    title: 'min-w-0 truncate font-medium',
    description: 'text-surface-foreground-muted truncate text-xs',
    endContent: 'shrink-0 text-sm tabular-nums',
    actions: 'flex shrink-0 items-center gap-2',
    openIcon: 'size-4',
  },
  variants: {
    hasActionSpace: {
      // As wide as the menu's control, which is an `IconButton` of the usual size.
      true: { actions: 'min-w-8 justify-end' },
    },
  },
});
