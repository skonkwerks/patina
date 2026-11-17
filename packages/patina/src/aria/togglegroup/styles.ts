import { tv, type VariantProps } from 'tailwind-variants';

import { DISABLED } from '../../internal/disabled.ts';
import { focusRing } from '../../internal/focus.ts';

/**
 * The look of a toggle, pressed or not, on its own or as a segment of a `ToggleGroup`. The same
 * `variant` and `size` words as a button: `outline` draws a border and fills with the primary color
 * when pressed; `ghost` has no border or fill, so its icon says whether it is on. Sizes match the
 * button scale (`sm` 28px, `md` 32px, `lg` 36px).
 */
export const toggleStyles = tv({
  extend: focusRing,
  base: 'inline-flex shrink-0 cursor-pointer items-center justify-center font-medium transition-colors select-none',
  variants: {
    variant: { outline: 'border', ghost: 'border border-transparent' },
    size: {
      sm: 'h-7 px-2.5 text-xs',
      md: 'h-8 px-3 text-sm',
      lg: 'h-9 px-4 text-sm',
    },
    /** A segment shares its edges with its neighbors; a toggle on its own is rounded all round. */
    isInGroup: {
      true: '-ml-px first:ml-0 first:rounded-l-md last:rounded-r-md',
      false: 'rounded-md',
    },
    isSelected: { true: 'z-10', false: '' },
    isDisabled: { true: DISABLED },
  },
  compoundVariants: [
    {
      variant: 'outline',
      isSelected: true,
      class: 'bg-primary text-primary-foreground border-primary',
    },
    {
      variant: 'outline',
      isSelected: false,
      class:
        'text-surface-foreground border-surface-border hover:bg-surface-hover bg-transparent',
    },
    {
      variant: 'ghost',
      class: 'text-surface-foreground hover:bg-surface-hover bg-transparent',
    },
  ],
  defaultVariants: {
    variant: 'outline',
    size: 'md',
    isInGroup: false,
  },
});

/** An icon toggle's look: the toggle look as a square of the size's height, matching `IconButton`. */
export const iconToggleStyles = tv({
  extend: toggleStyles,
  compoundVariants: [
    { size: 'sm', class: 'w-7 px-0' },
    { size: 'md', class: 'w-8 px-0' },
    { size: 'lg', class: 'w-9 px-0' },
  ],
});

export type ToggleStyleProps = Pick<
  VariantProps<typeof toggleStyles>,
  'variant' | 'size'
>;
