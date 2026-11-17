import { tv, type VariantProps } from 'tailwind-variants';

import { DISABLED } from './disabled.ts';
import { focusRing } from './focus.ts';

/**
 * The button look, shared by `Button`, `IconButton` and `LinkButton`. Four independent choices:
 *
 * - `variant`, how it looks: `solid` (filled), `outline` (bordered), `ghost` (no fill until
 *   hovered) or `link` (text that reads as a link, sized by the text around it).
 * - `tone`, what it means: `neutral`, `primary` or `destructive`.
 * - `size`, the one control scale: `sm` 28px, `md` 32px (the default), `lg` 36px.
 * - `radius`: `md` (rounded corners) or `full` (a pill; a circle on an `IconButton`).
 *
 * `IconButton` extends it as a square of the size's height (`iconButtonStyles`). It reads
 * React Aria's render state: a disabled button is dimmed because it cannot be used, while a pending
 * one keeps its full look, because its spinner already says it is working.
 */
export const buttonStyles = tv({
  extend: focusRing,
  base: 'inline-flex shrink-0 cursor-pointer items-center justify-center font-medium whitespace-nowrap transition-colors select-none',
  variants: {
    variant: {
      solid: '',
      outline: 'border',
      ghost: 'bg-transparent',
      // Always underlined, as a text link is, since it stands in running text.
      link: 'bg-transparent underline underline-offset-4 hover:decoration-2',
    },
    tone: { neutral: '', primary: '', destructive: '' },
    size: {
      sm: 'h-7 gap-1 px-2.5 text-xs',
      md: 'h-8 gap-1.5 px-3 text-sm',
      lg: 'h-9 gap-2 px-4 text-sm',
    },
    radius: { md: 'rounded-md', full: 'rounded-full' },
    isDisabled: { true: DISABLED, false: '' },
    isPending: { true: 'cursor-progress', false: '' },
  },
  compoundVariants: [
    // Colors: variant × tone.
    {
      variant: 'solid',
      tone: 'neutral',
      class: 'bg-neutral text-neutral-foreground hover:bg-neutral-hover',
    },
    {
      variant: 'solid',
      tone: 'primary',
      class: 'bg-primary text-primary-foreground hover:bg-primary-hover',
    },
    {
      variant: 'solid',
      tone: 'destructive',
      class:
        'bg-destructive text-destructive-foreground hover:bg-destructive-hover',
    },
    {
      variant: 'outline',
      tone: 'neutral',
      class:
        'border-surface-border bg-surface text-surface-foreground hover:bg-surface-hover',
    },
    {
      variant: 'outline',
      tone: 'primary',
      class:
        'border-primary text-primary hover:bg-surface-hover bg-transparent',
    },
    {
      variant: 'outline',
      tone: 'destructive',
      class:
        'border-destructive text-destructive hover:bg-destructive-tint/10 bg-transparent',
    },
    {
      variant: 'ghost',
      tone: 'neutral',
      class:
        'text-surface-foreground-muted hover:bg-surface-hover hover:text-surface-foreground',
    },
    {
      variant: 'ghost',
      tone: 'primary',
      class: 'text-primary hover:bg-surface-hover',
    },
    {
      variant: 'ghost',
      tone: 'destructive',
      class: 'text-destructive hover:bg-destructive-tint/10',
    },
    {
      variant: 'link',
      tone: 'neutral',
      class: 'text-surface-foreground',
    },
    {
      variant: 'link',
      tone: 'primary',
      class: 'text-primary hover:text-primary-hover',
    },
    {
      variant: 'link',
      tone: 'destructive',
      class: 'text-destructive',
    },
    // A link takes the size, weight and line of the text around it; `size` does not apply.
    {
      variant: 'link',
      class: 'h-auto rounded-sm px-0 py-0 font-[inherit] text-[length:inherit]',
    },
    // A disabled button that explains why stays hoverable (for its tooltip), so hover changes nothing.
    {
      isDisabled: true,
      isPending: false,
      variant: 'solid',
      tone: 'neutral',
      class: 'hover:bg-neutral',
    },
    {
      isDisabled: true,
      isPending: false,
      variant: 'solid',
      tone: 'primary',
      class: 'hover:bg-primary',
    },
    {
      isDisabled: true,
      isPending: false,
      variant: 'solid',
      tone: 'destructive',
      class: 'hover:bg-destructive',
    },
    {
      isDisabled: true,
      isPending: false,
      variant: 'outline',
      tone: 'neutral',
      class: 'hover:bg-surface',
    },
    {
      isDisabled: true,
      isPending: false,
      variant: ['outline', 'ghost'],
      tone: ['primary', 'destructive'],
      class: 'hover:bg-transparent',
    },
    {
      isDisabled: true,
      isPending: false,
      variant: 'ghost',
      tone: 'neutral',
      class: 'hover:text-surface-foreground-muted hover:bg-transparent',
    },
    {
      isDisabled: true,
      isPending: false,
      variant: 'link',
      class: 'hover:decoration-auto',
    },
  ],
  defaultVariants: {
    variant: 'outline',
    tone: 'neutral',
    size: 'md',
    radius: 'md',
    isDisabled: false,
    isPending: false,
  },
});

/** The look choices a caller makes, shared by every button-like component. */
export type ButtonStyleProps = Pick<
  VariantProps<typeof buttonStyles>,
  'variant' | 'tone' | 'size' | 'radius'
>;
