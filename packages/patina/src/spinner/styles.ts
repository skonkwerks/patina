import { tv } from 'tailwind-variants';

export const spinnerStyles = tv({
  base: 'shrink-0 animate-spin motion-reduce:animate-none',
  variants: {
    size: {
      /** 14px: inline with small text, or in a small button. */
      sm: 'size-3.5',
      /** 16px: beside a control's label, as a button's pending spinner. */
      md: 'size-4',
      /** 20px: in place of an icon, or standing alone in a section. */
      lg: 'size-5',
    },
  },
  defaultVariants: { size: 'md' },
});

export const pendingStatusStyles = tv({
  base: 'flex items-center gap-2 text-sm',
});
