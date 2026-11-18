import { tv } from 'tailwind-variants';

/**
 * The one heading grammar for pages and sections: the title with its count, the help control and
 * badges beside it, the actions at the right, and one line of description under the title. The
 * `page` and `section` looks differ only here.
 */
export const headerStyles = tv({
  slots: {
    root: 'flex flex-col gap-2',
    row: 'flex flex-wrap items-start justify-between gap-3',
    // The title yields its width to the actions and wraps; the actions never wrap under it.
    main: 'min-w-0 flex-1',
    mediaFrame: 'relative aspect-square',
    media:
      'absolute inset-0 flex items-center justify-center [&>*]:h-full [&>*]:w-full',
    text: 'flex min-w-0 flex-col gap-1',
    titleRow: 'flex flex-wrap items-center gap-x-1 gap-y-1',
    title: 'text-canvas-foreground min-w-0 font-semibold break-words',
    count: 'text-canvas-foreground-muted font-normal',
    contextualHelp: 'flex items-center',
    badges: 'ms-1 flex shrink-0 items-center gap-1',
    description: 'text-canvas-foreground-muted text-sm',
    actions: 'flex shrink-0 flex-wrap items-center gap-2',
  },
  variants: {
    variant: {
      page: { title: 'text-2xl tracking-tight', count: 'text-xl' },
      section: { title: 'text-lg', count: 'text-base' },
    },
    hasMedia: {
      true: {
        main: 'grid grid-cols-[auto_minmax(0,1fr)] items-stretch gap-3',
      },
    },
  },
  defaultVariants: { variant: 'page' },
});
