import { tv } from 'tailwind-variants';

/**
 * The one small rounded label. A status tone draws its text in the strong status color on a faint
 * tint of the same hue; `neutral` draws a plain surface chip with a border, so a category reads as
 * a label and never as an action (the neutral button fill is not used). An application that needs
 * a chip in its own colors, such as one per category, extends this with its own `tone`-like variant.
 */
export const chipStyles = tv({
  base: 'inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap',
  variants: {
    tone: {
      neutral: 'bg-surface text-surface-foreground border-surface-border',
      info: 'bg-info-tint/15 text-info border-transparent',
      success: 'bg-success-tint/15 text-success border-transparent',
      warning: 'bg-warning-tint/15 text-warning border-transparent',
      destructive: 'bg-destructive-tint/15 text-destructive border-transparent',
    },
  },
  defaultVariants: { tone: 'neutral' },
});
