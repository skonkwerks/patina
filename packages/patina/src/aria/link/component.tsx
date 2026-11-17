import {
  Link as AriaLink,
  type LinkProps as AriaLinkProps,
} from 'react-aria-components';
import { tv } from 'tailwind-variants';

import { DISABLED } from '../../internal/disabled.ts';
import { focusRing } from '../../internal/focus.ts';

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
