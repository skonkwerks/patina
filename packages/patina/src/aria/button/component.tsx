import type { Ref } from 'react';
import type { ButtonProps as AriaButtonProps } from 'react-aria-components';

import { ButtonBase } from './base.js';
import { type ButtonStyleProps, buttonStyles } from './styles.js';

export type ButtonProps = Omit<AriaButtonProps, 'className'> &
  ButtonStyleProps & {
    className?: string;
    /**
     * Why the button cannot be pressed now. While it is given, the button is disabled, stays
     * focusable, and says why on hover and focus, so a caller gives the reason alone and no
     * `isDisabled` beside it. Its own press and click do nothing, but a React Aria trigger around
     * it (a menu's, a dialog's) still opens on a press, so a button with a reason stands outside
     * any trigger. `isDisabled` by itself is for a button with nothing to say, such as one that
     * waits while a sibling's write is pending. The button carries its own tooltip trigger
     * (`ButtonTooltip`), so no `TooltipTrigger` is put around it.
     */
    disabledReason?: string;
    /**
     * A short hint shown on hover and focus while the button can be pressed, such as what it does
     * when its label alone may not say. While it is disabled, `disabledReason` shows instead.
     */
    tooltip?: string;
    /** React 19 ref prop, for a caller that moves focus to or from the button. */
    ref?: Ref<HTMLButtonElement>;
  };

/**
 * The button with a text label, optionally with an icon beside the text: React Aria semantics,
 * token colors, one focus ring. Its look is `variant` × `tone` × `size` × `radius` (see
 * `buttonStyles`). A button that shows only an icon is an `IconButton`. While `isPending`, a
 * decorative spinner leads the label and presses are ignored; the label itself never changes, and
 * React Aria announces the pending state to assistive technology.
 */
export const Button = ({
  variant,
  tone,
  size,
  radius,
  ...rest
}: ButtonProps) => (
  <ButtonBase
    {...rest}
    styles={(state) => buttonStyles({ ...state, variant, tone, size, radius })}
    pendingIndicator='leading'
    spinnerSize={size === 'sm' ? 'sm' : 'md'}
  />
);
