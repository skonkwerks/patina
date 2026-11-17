import {
  Tabs as AriaTabs,
  type TabsProps as AriaTabsProps,
} from 'react-aria-components';
import { tv } from 'tailwind-variants';

export const tabsStyles = tv({ base: 'flex min-w-0 flex-col gap-4' });

/** React Aria's props, with `className` for layout only. */
export type TabsProps = Omit<AriaTabsProps, 'className'> & {
  className?: string;
};

export const Tabs = ({ className, ...props }: TabsProps) => (
  <AriaTabs {...props} className={tabsStyles({ className })} />
);
