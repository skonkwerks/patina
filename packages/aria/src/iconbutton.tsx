import { tv } from 'tailwind-variants';

import type { ButtonProps } from './button.tsx';
import { ButtonBase } from './buttonbase.tsx';
import { buttonStyles } from './buttonstyles.ts';

/**
 * The icon button's look: the button look (`variant`, `tone`, `size`, `radius`) as a square of the
 * size's height, or a circle with `radius='full'`.
 */
export const iconButtonStyles = tv({
  extend: buttonStyles,
  compoundVariants: [
    { size: 'sm', class: 'w-7 px-0' },
    { size: 'md', class: 'w-8 px-0' },
    { size: 'lg', class: 'w-9 px-0' },
  ],
});

export type IconButtonProps = Omit<ButtonProps, 'aria-label' | 'tooltip'> & {
  /** Required: a button that shows only an icon has no visible text, so this is its whole accessible name. */
  'aria-label': string;
  /**
   * Shows its name (`aria-label`) as its tooltip on hover and focus while it has no disabled reason
   * to show, for a control whose icon alone may not say what pressing it does, such as a theme
   * switch or a sidebar toggle.
   */
  hasTooltip?: boolean;
};

/**
 * A button that shows only an icon, such as close or refresh: ghost and neutral by default (no fill
 * until hovered), a square of the size's height, and a required name. `radius='full'` makes it a
 * circle, such as a dialog's close button. It behaves as a `Button` does (disabled reason, pending,
 * tooltip); while pending, the spinner stands in place of the icon. A button with text is a `Button`.
 */
export const IconButton = ({
  variant = 'ghost',
  tone,
  size,
  radius,
  hasTooltip = false,
  ...rest
}: IconButtonProps) => (
  <ButtonBase
    {...rest}
    tooltip={hasTooltip ? rest['aria-label'] : undefined}
    styles={(state) =>
      iconButtonStyles({ ...state, variant, tone, size, radius })
    }
    pendingIndicator='replace'
    spinnerSize={size === 'sm' ? 'sm' : 'md'}
  />
);
