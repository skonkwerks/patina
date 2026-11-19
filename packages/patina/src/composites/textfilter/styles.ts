import { tv } from 'tailwind-variants';

/**
 * The text filter's look, as Cloudscape's: the search box under its label, growing to fill its
 * place up to Cloudscape's 648px (its small breakpoint less the tools row's padding), and the
 * count of matches after the box, on its line, in the text's own color.
 */
export const textFilterStyles = tv({
  slots: {
    root: 'flex max-w-[40.5rem] items-end gap-3',
    field: 'min-w-0 flex-1',
    count:
      'text-surface-foreground flex h-8 shrink-0 items-center text-sm whitespace-nowrap',
  },
});
