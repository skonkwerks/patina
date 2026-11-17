import { tv } from 'tailwind-variants';

/**
 * A list of label and value pairs on a surface, one pair per row with a divider between. Side by
 * side (`horizontal`), the label sits in a fixed column on the first line of its value, even when
 * the value is a control taller than a line of text; `stacked` puts the label above the value, for
 * a narrow detail panel.
 */
export const propertyListStyles = tv({
  slots: {
    root: 'bg-surface border-surface-border divide-surface-border divide-y rounded-lg border text-sm',
    row: 'grid px-4',
    // A label can come from outside, such as a field name: one longer than its column breaks, as a value does.
    label: 'text-surface-foreground-muted min-w-0 break-words',
    value: 'text-surface-foreground min-w-0 break-words',
    empty: 'text-surface-foreground-muted',
  },
  variants: {
    layout: {
      horizontal: {
        row: 'grid-cols-[10rem_minmax(0,1fr)] items-baseline gap-4 py-2',
      },
      stacked: { row: 'grid-cols-1 gap-1 py-3' },
    },
  },
  defaultVariants: { layout: 'horizontal' },
});
