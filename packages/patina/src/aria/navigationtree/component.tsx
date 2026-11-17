import {
  NavigationTree as AriaNavigationTree,
  type NavigationTreeProps as AriaNavigationTreeProps,
} from 'react-aria-components';
import { tv } from 'tailwind-variants';

export const navigationTreeStyles = tv({ base: 'flex flex-col outline-0' });

export type NavigationTreeProps<T extends object> = Omit<
  AriaNavigationTreeProps<T>,
  'className'
> & {
  /** Layout only. */
  className?: string;
};

/**
 * Navigation through a set of destinations. React Aria supplies the tree semantics, arrow-key
 * movement, typeahead, and `aria-current='page'` on the item whose `href` matches `selectedRoute`,
 * which is the current page's path.
 * Place it inside a `<nav>` landmark with an `aria-label`.
 */
export const NavigationTree = <T extends object>({
  className,
  ...props
}: NavigationTreeProps<T>) => (
  <AriaNavigationTree
    {...props}
    className={navigationTreeStyles({ className })}
  />
);
