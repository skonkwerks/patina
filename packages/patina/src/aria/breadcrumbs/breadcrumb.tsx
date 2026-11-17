import {
  Breadcrumb as AriaBreadcrumb,
  type BreadcrumbProps as AriaBreadcrumbProps,
} from 'react-aria-components';
import { tv } from 'tailwind-variants';

export const breadcrumbStyles = tv({
  slots: {
    root: 'group flex min-w-0 items-center gap-2',
    separator: 'text-canvas-foreground-muted group-last:hidden',
  },
});

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
