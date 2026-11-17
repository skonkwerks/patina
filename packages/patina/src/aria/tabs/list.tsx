import {
  TabList as AriaTabList,
  type TabListProps as AriaTabListProps,
} from 'react-aria-components';
import { tv } from 'tailwind-variants';

export const tabListStyles = tv({
  base: 'border-canvas-border flex gap-2 border-b',
});

export type TabListProps<T extends object> = Omit<
  AriaTabListProps<T>,
  'className'
> & { className?: string };

export const TabList = <T extends object>({
  className,
  ...props
}: TabListProps<T>) => (
  <AriaTabList {...props} className={tabListStyles({ className })} />
);
