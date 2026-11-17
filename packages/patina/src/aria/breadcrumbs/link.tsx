import {
  Link as AriaLink,
  type LinkProps as AriaLinkProps,
} from 'react-aria-components';
import { tv } from 'tailwind-variants';

import { focusRing } from '../../internal/focus.ts';

export const breadcrumbLinkStyles = tv({
  extend: focusRing,
  base: 'min-w-0 rounded-sm break-words underline-offset-4',
  variants: {
    isCurrent: {
      true: 'text-canvas-foreground-muted cursor-default font-normal',
      false: 'text-canvas-foreground hover:underline',
    },
  },
});

export type BreadcrumbLinkProps = Omit<AriaLinkProps, 'className'> & {
  /** Layout only. */
  className?: string;
};

/**
 * A crumb's link, its text as given (sentence case from the vocabulary, product nouns kept). React
 * Aria owns current-page semantics and delegates navigation to its router provider.
 */
export const BreadcrumbLink = ({
  className,
  ...props
}: BreadcrumbLinkProps) => (
  <AriaLink
    {...props}
    className={(state) => breadcrumbLinkStyles({ ...state, className })}
  />
);
