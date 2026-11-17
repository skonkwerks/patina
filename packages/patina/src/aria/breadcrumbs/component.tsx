import {
  Breadcrumbs as AriaBreadcrumbs,
  type BreadcrumbsProps as AriaBreadcrumbsProps,
} from 'react-aria-components';
import { tv } from 'tailwind-variants';

export const breadcrumbsStyles = tv({
  base: 'flex flex-wrap items-center gap-x-2 gap-y-1 text-sm',
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
