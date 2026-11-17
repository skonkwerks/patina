import {
  Link as AriaLink,
  type LinkProps as AriaLinkProps,
} from 'react-aria-components';
import { tv } from 'tailwind-variants';

import { type ButtonStyleProps, buttonStyles } from './buttonstyles.ts';
import { DISABLED } from './disabled.ts';
import { focusRing } from './focus.ts';

/**
 * A text link: in the primary color and always underlined, since a link in running text must be
 * told apart from the text by more than its color. Hover thickens the underline.
 */
export const linkStyles = tv({
  extend: focusRing,
  base: 'text-primary hover:text-primary-hover cursor-pointer rounded-sm underline underline-offset-4 hover:decoration-2',
  variants: { isDisabled: { true: DISABLED } },
});

export type LinkProps = Omit<AriaLinkProps, 'className'> & {
  /** Layout only. */
  className?: string;
};

/** A text link. React Aria delegates navigation to the router through its router provider. */
export const Link = ({ className, ...props }: LinkProps) => (
  <AriaLink
    {...props}
    className={(state) => linkStyles({ ...state, className })}
  />
);

export type LinkButtonProps = Omit<AriaLinkProps, 'className'> &
  ButtonStyleProps & {
    className?: string;
  };

/** A link that looks like a `Button`, for a navigation presented as an action. Same look props. */
export const LinkButton = ({
  variant,
  tone,
  size,
  radius,
  className,
  ...props
}: LinkButtonProps) => (
  <AriaLink
    {...props}
    className={(state) =>
      buttonStyles({
        ...state,
        variant,
        tone,
        size,
        radius,
        className,
      })
    }
  />
);
