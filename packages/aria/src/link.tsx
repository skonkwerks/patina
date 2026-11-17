import {
  composeRenderProps,
  Link as AriaLink,
  type LinkProps as AriaLinkProps,
} from 'react-aria-components';
import { tv } from 'tailwind-variants';

import { type ButtonStyleProps, buttonStyles } from './buttonstyles.ts';
import { focusRing } from './focus.ts';

export const linkStyles = tv({
  extend: focusRing,
  base: 'text-primary hover:text-primary-hover cursor-pointer rounded-sm underline-offset-4 hover:underline',
});

export type LinkProps = AriaLinkProps;

/** A text link. React Aria delegates navigation to the router through its router provider. */
export const Link = ({ className, ...props }: LinkProps) => (
  <AriaLink
    {...props}
    className={composeRenderProps(className, (cls, state) =>
      linkStyles({ ...state, className: cls }),
    )}
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
