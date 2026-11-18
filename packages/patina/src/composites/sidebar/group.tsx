import type { ReactNode } from 'react';

import {
  NavigationTreeHeader,
  NavigationTreeSection,
} from '../../aria/navigationtree/index.ts';
import { useSidebar } from './context.ts';

export type SidebarGroupProps = {
  id: string;
  /** The group's name, over its items; on the rail it is visually hidden and still names the group. */
  title: string;
  /** The group's `SidebarItem`s. */
  children: ReactNode;
};

/**
 * A named group of the sidebar's items. A group after the first is set off by a line, which stays
 * on the rail, where the name is hidden, so the groups still read as groups there.
 */
export const SidebarGroup = ({ id, title, children }: SidebarGroupProps) => {
  const { isCollapsed } = useSidebar();
  return (
    <NavigationTreeSection id={id}>
      <NavigationTreeHeader isHidden={isCollapsed}>
        {title}
      </NavigationTreeHeader>
      {children}
    </NavigationTreeSection>
  );
};
