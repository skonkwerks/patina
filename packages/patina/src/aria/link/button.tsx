import {
  Link as AriaLink,
  type LinkProps as AriaLinkProps,
} from 'react-aria-components';

import { type ButtonStyleProps, buttonStyles } from '../button/index.ts';

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
