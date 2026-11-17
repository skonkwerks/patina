import { tv } from 'tailwind-variants';

/**
 * The one look of an in-page notice: a rounded frame on a faint tint of the tone, then in one row
 * the tone's icon, the words (a title, the text, and the actions under them), and the close
 * control at the end. `neutral` draws a plain surface notice.
 */
export const alertStyles = tv({
  slots: {
    root: 'text-surface-foreground grid items-start gap-x-3 rounded-xl border p-4',
    icon: 'mt-0.5 flex size-5 shrink-0 items-center justify-center [&>svg]:size-5',
    main: 'flex min-w-0 flex-col gap-1',
    title: 'text-sm font-medium',
    text: 'text-sm leading-6',
    actions: 'mt-2 flex flex-wrap gap-2',
    close: '-me-1 -mt-1',
  },
  variants: {
    tone: {
      neutral: {
        root: 'bg-surface border-surface-border',
        icon: 'text-surface-foreground-muted',
      },
      info: { root: 'bg-info-tint/10 border-info-tint/30', icon: 'text-info' },
      success: {
        root: 'bg-success-tint/10 border-success-tint/25',
        icon: 'text-success',
      },
      warning: {
        root: 'bg-warning-tint/10 border-warning-tint/30',
        icon: 'text-warning',
      },
      error: {
        root: 'bg-error-tint/10 border-error-tint/30',
        icon: 'text-error',
      },
    },
    /** A close control ends the row in a third column; without one there is no empty column or gap. */
    hasClose: {
      true: { root: 'grid-cols-[auto_minmax(0,1fr)_auto]' },
      false: { root: 'grid-cols-[auto_minmax(0,1fr)]' },
    },
  },
  defaultVariants: { tone: 'info', hasClose: false },
});
