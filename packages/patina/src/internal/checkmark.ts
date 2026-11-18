import { tv } from 'tailwind-variants';

/**
 * A checkbox's mark, defined once for `Checkbox` and `MultiSelect`'s options: a square with a
 * control's edge while off, and no fill, so it reads on any layer; filled with the primary color
 * and showing its check while on. `size`: `md` (20px, a form's checkbox) or `sm` (16px, a list
 * row's, beside a 14px label).
 */
export const checkMarkStyles = tv({
  slots: {
    box: 'border-control-border flex shrink-0 items-center justify-center rounded border',
    check: 'text-primary-foreground opacity-0',
  },
  variants: {
    size: {
      md: { box: 'size-5', check: 'size-4' },
      sm: { box: 'size-4', check: 'size-3.5' },
    },
    isSelected: {
      true: { box: 'border-primary bg-primary', check: 'opacity-100' },
    },
  },
  defaultVariants: { size: 'md' },
});
