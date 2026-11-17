import {
  composeRenderProps,
  Tab as AriaTab,
  TabList as AriaTabList,
  type TabListProps,
  TabPanel as AriaTabPanel,
  type TabPanelProps,
  type TabProps,
  Tabs as AriaTabs,
  type TabsProps,
} from 'react-aria-components';
import { tv } from 'tailwind-variants';

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
    isDisabled: { true: 'text-canvas-foreground-muted cursor-default' },
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

// The wrappers take React Aria's own props, re-exported for callers. `className` may be a
// function of the component's state there, so each wrapper composes its classes onto it with
// `composeRenderProps` instead of joining strings.
export type { TabListProps, TabPanelProps, TabProps, TabsProps };

export const Tabs = ({ className, ...props }: TabsProps) => (
  <AriaTabs
    {...props}
    className={composeRenderProps(className, (cls) =>
      tabsStyles({ className: cls }),
    )}
  />
);
export const TabList = <T extends object>({
  className,
  ...props
}: TabListProps<T>) => (
  <AriaTabList
    {...props}
    className={composeRenderProps(className, (cls) =>
      tabListStyles({ className: cls }),
    )}
  />
);
export const Tab = ({ className, ...props }: TabProps) => (
  <AriaTab
    {...props}
    className={composeRenderProps(className, (cls, state) =>
      tabStyles({ ...state, className: cls }),
    )}
  />
);
/**
 * A tab's content. One kept mounted while another tab is selected (`shouldForceMount`), so its state
 * survives, is hidden then: React Aria makes it inert but leaves its display to the styling.
 */
export const TabPanel = ({ className, ...props }: TabPanelProps) => (
  <AriaTabPanel
    {...props}
    className={composeRenderProps(className, (cls, state) =>
      tabPanelStyles({ ...state, className: cls }),
    )}
  />
);
