import {
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarLeftExpand,
} from '@tabler/icons-react';
import { type ReactNode, useId } from 'react';

import { IconButton } from '../../aria/iconbutton/index.ts';
import { NavigationTree } from '../../aria/navigationtree/index.ts';
import { SidebarContext } from './context.ts';
import { sidebarStyles } from './styles.ts';

export type SidebarProps = {
  /** The navigation's name, such as "Main": the landmark's and the tree's. */
  'aria-label': string;
  /** The current page's path; the item whose `href` matches it is the current page. */
  selectedRoute?: string;
  /** At the top: a `SidebarHeader` with the brand and its compact mark. */
  header?: ReactNode;
  /** The groups of items: `SidebarGroup`s holding `SidebarItem`s. */
  children: ReactNode;
  /**
   * The app's controls at the foot, before the collapse toggle, such as a status and the
   * `ThemeMode`. Their layout is the app's: they sit in a row, and a margin such as `ms-auto` sends
   * one to the end, beside the toggle. A control that must change on the rail reads `useSidebar()`.
   */
  footer?: ReactNode;
  /** Whether the sidebar is the collapsed rail. The app holds it, and remembers it if it wants to. */
  isCollapsed: boolean;
  onCollapsedChange: (isCollapsed: boolean) => void;
  /** The collapse toggle's name while the sidebar is open, such as "Collapse sidebar". */
  collapseLabel: string;
  /** The collapse toggle's name on the rail, such as "Expand sidebar". */
  expandLabel: string;
};

/**
 * The sidebar contents for the shell's `sidebar` slot: a `nav` landmark with the header, the groups
 * of items (which scroll when there are many), and the footer row, whose last control collapses
 * the sidebar to a rail of icons and expands it again. The toggle says whether the sidebar is
 * expanded and names the sidebar it controls. The items are one Tab stop, as a collection is: the
 * arrow keys move between them, and Tab leaves for the footer. Everything inside learns whether it is collapsed
 * (`useSidebar`), so the header shows its mark and the items hide their names behind tooltips.
 */
export const Sidebar = ({
  'aria-label': label,
  selectedRoute,
  header,
  children,
  footer,
  isCollapsed,
  onCollapsedChange,
  collapseLabel,
  expandLabel,
}: SidebarProps) => {
  const id = useId();
  const styles = sidebarStyles({ isCollapsed });
  const ToggleIcon = isCollapsed
    ? IconLayoutSidebarLeftExpand
    : IconLayoutSidebarLeftCollapse;
  return (
    <SidebarContext value={{ isCollapsed }}>
      <nav id={id} aria-label={label} className={styles.root()}>
        {header}
        <NavigationTree
          aria-label={label}
          selectedRoute={selectedRoute}
          className={styles.tree()}
        >
          {children}
        </NavigationTree>
        <div className={styles.footer()}>
          {footer !== undefined && (
            <div className={styles.footerContent()}>{footer}</div>
          )}
          <IconButton
            aria-label={isCollapsed ? expandLabel : collapseLabel}
            hasTooltip
            aria-expanded={!isCollapsed}
            aria-controls={id}
            onPress={() => onCollapsedChange(!isCollapsed)}
          >
            <ToggleIcon aria-hidden className={styles.toggleIcon()} />
          </IconButton>
        </div>
      </nav>
    </SidebarContext>
  );
};
