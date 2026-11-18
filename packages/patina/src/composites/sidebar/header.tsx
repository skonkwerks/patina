import type { ReactNode } from 'react';

import { useSidebar } from './context.ts';
import { sidebarHeaderStyles } from './styles.ts';

export type SidebarHeaderProps = {
  /** The product's brand while the sidebar is open, such as its logo with the product's name. */
  brand: ReactNode;
  /** The compact mark on the rail, such as the logo's icon alone; it carries the same name. */
  mark: ReactNode;
};

/** The sidebar's header: the brand while the sidebar is open, the compact mark on the rail. */
export const SidebarHeader = ({ brand, mark }: SidebarHeaderProps) => {
  const { isCollapsed } = useSidebar();
  return (
    <div className={sidebarHeaderStyles({ isCollapsed })}>
      {isCollapsed ? mark : brand}
    </div>
  );
};
