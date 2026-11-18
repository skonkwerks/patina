import {
  TabPanel as AriaTabPanel,
  type TabPanelProps as AriaTabPanelProps,
} from 'react-aria-components';
import { tv } from 'tailwind-variants';

import { focusRing } from '../../internal/focus.js';

/**
 * A tab's content. One kept mounted while another tab is selected (`shouldForceMount`) is hidden
 * then: React Aria makes it inert but leaves its display to the styling.
 */
export const tabPanelStyles = tv({
  extend: focusRing,
  base: 'flex min-w-0 flex-col gap-4 data-[inert]:hidden',
});

export type TabPanelProps = Omit<AriaTabPanelProps, 'className'> & {
  className?: string;
};

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
