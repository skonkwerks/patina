import {
  Tab as AriaTab,
  TabList as AriaTabList,
  type TabListProps as AriaTabListProps,
  TabPanel as AriaTabPanel,
  type TabPanelProps as AriaTabPanelProps,
  type TabProps as AriaTabProps,
  Tabs as AriaTabs,
  type TabsProps as AriaTabsProps,
} from 'react-aria-components';
import { tv } from 'tailwind-variants';

import { DISABLED } from './disabled.ts';
import { focusRing } from './focus.ts';

export const tabsStyles = tv({ base: 'flex min-w-0 flex-col gap-4' });

export const tabListStyles = tv({
  base: 'border-canvas-border flex gap-2 border-b',
});

export const tabStyles = tv({
  extend: focusRing,
  base: 'cursor-pointer border-b-2 px-3 py-2 text-sm font-medium',
  variants: {
    isSelected: {
      true: 'border-primary text-canvas-foreground',
      false:
        'text-canvas-foreground-muted hover:text-canvas-foreground border-transparent',
    },
    isDisabled: { true: DISABLED },
  },
});

/**
 * A tab's content. One kept mounted while another tab is selected (`shouldForceMount`) is hidden
 * then: React Aria makes it inert but leaves its display to the styling.
 */
export const tabPanelStyles = tv({
  extend: focusRing,
  base: 'flex min-w-0 flex-col gap-4 data-[inert]:hidden',
});

/** React Aria's props, with `className` for layout only. */
export type TabsProps = Omit<AriaTabsProps, 'className'> & {
  className?: string;
};
export type TabListProps<T extends object> = Omit<
  AriaTabListProps<T>,
  'className'
> & { className?: string };
export type TabProps = Omit<AriaTabProps, 'className'> & { className?: string };
export type TabPanelProps = Omit<AriaTabPanelProps, 'className'> & {
  className?: string;
};

export const Tabs = ({ className, ...props }: TabsProps) => (
  <AriaTabs {...props} className={tabsStyles({ className })} />
);
export const TabList = <T extends object>({
  className,
  ...props
}: TabListProps<T>) => (
  <AriaTabList {...props} className={tabListStyles({ className })} />
);
export const Tab = ({ className, ...props }: TabProps) => (
  <AriaTab
    {...props}
    className={(state) => tabStyles({ ...state, className })}
  />
);
/**
 * A tab's content. One kept mounted while another tab is selected (`shouldForceMount`), so its state
 * survives, is hidden then: React Aria makes it inert but leaves its display to the styling.
 */
export const TabPanel = ({ className, ...props }: TabPanelProps) => (
  <AriaTabPanel
    {...props}
    className={(state) => tabPanelStyles({ ...state, className })}
  />
);
