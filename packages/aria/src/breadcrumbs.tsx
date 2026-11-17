import {
  Breadcrumb as AriaBreadcrumb,
  type BreadcrumbProps as AriaBreadcrumbProps,
  Breadcrumbs as AriaBreadcrumbs,
  type BreadcrumbsProps as AriaBreadcrumbsProps,
  Link as AriaLink,
  type LinkProps as AriaLinkProps,
} from 'react-aria-components';
import { tv } from 'tailwind-variants';

import { focusRing } from './focus.ts';

export const breadcrumbsStyles = tv({
  base: 'flex flex-wrap items-center gap-x-2 gap-y-1 text-sm',
});

export const breadcrumbStyles = tv({
  slots: {
    root: 'group flex min-w-0 items-center gap-2',
    separator: 'text-canvas-foreground-muted group-last:hidden',
  },
});

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

export type BreadcrumbsProps<T extends object> = Omit<
  AriaBreadcrumbsProps<T>,
  'className'
> & {
  /** Layout only: width, margins, and placement. */
  className?: string;
};

/** Shared hierarchy presentation. React Aria supplies list, current-page, and link semantics. */
export const Breadcrumbs = <T extends object>({
  className,
  ...props
}: BreadcrumbsProps<T>) => (
  <AriaBreadcrumbs {...props} className={breadcrumbsStyles({ className })} />
);

export type BreadcrumbProps = Omit<AriaBreadcrumbProps, 'className'> & {
  /** Layout only. */
  className?: string;
};

/** One crumb: its link, then the separator, which the last crumb hides. */
export const Breadcrumb = ({
  className,
  children,
  ...props
}: BreadcrumbProps) => {
  const styles = breadcrumbStyles();
  return (
    <AriaBreadcrumb {...props} className={styles.root({ className })}>
      {(state) => (
        <>
          {typeof children === 'function' ? children(state) : children}
          <span aria-hidden='true' className={styles.separator()}>
            /
          </span>
        </>
      )}
    </AriaBreadcrumb>
  );
};

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
