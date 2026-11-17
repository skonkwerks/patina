import {
  Breadcrumb as AriaBreadcrumb,
  type BreadcrumbProps,
  Breadcrumbs as AriaBreadcrumbs,
  type BreadcrumbsProps,
  composeRenderProps,
  Link as AriaLink,
  type LinkProps,
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
  base: 'min-w-0 rounded-sm break-words lowercase underline-offset-4',
  variants: {
    isCurrent: {
      true: 'text-canvas-foreground-muted cursor-default font-normal',
      false: 'text-canvas-foreground hover:underline',
    },
  },
});
/** Shared hierarchy presentation. React Aria supplies list, current-page, and link semantics. */
export const Breadcrumbs = <T extends object>({
  className,
  ...props
}: BreadcrumbsProps<T>) => (
  <AriaBreadcrumbs {...props} className={breadcrumbsStyles({ className })} />
);
export const Breadcrumb = ({
  className,
  children,
  ...props
}: BreadcrumbProps) => {
  const styles = breadcrumbStyles();
  return (
    <AriaBreadcrumb
      {...props}
      className={composeRenderProps(className, (cls) =>
        styles.root({ className: cls }),
      )}
    >
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
/** React Aria owns current-page semantics and delegates navigation to its router provider. */
export const BreadcrumbLink = ({ className, ...props }: LinkProps) => (
  <AriaLink
    {...props}
    className={composeRenderProps(className, (cls, state) =>
      breadcrumbLinkStyles({ ...state, className: cls }),
    )}
  />
);
