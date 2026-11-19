import type { ReactNode } from 'react';

import { SidePanelProvider } from '../sidepanel/index.js';
import ShellLayout from './layout.js';

export type AppShellProps = {
  /**
   * The sidebar contents at the left: a `Sidebar` with its header, groups of items and footer
   * (`@skonkwerks/patina/sidebar`).
   */
  sidebar: ReactNode;
  /** The page, rendered in the scrolling main area, such as the router's outlet. */
  children: ReactNode;
  /** The name of the side panel's close control, such as "Close". */
  panelCloseLabel: string;
  /**
   * The notification area, such as a `ToastRegion`. The side panel sets `--side-panel-offset` on
   * the document's root element to the room it takes (none while closed), where it reaches the
   * toast region React Aria renders into the document's body, so the area can stand clear of it:
   * `className='right-[calc(var(--side-panel-offset,0px)+1rem)]'`.
   */
  notifications?: ReactNode;
};

/**
 * The one application shell, rendered once above every page: the sidebar, the scrolling main area,
 * the side panel at the right edge, and the notification area. It holds the side panel's state, so
 * every page can show content in the panel (`useSidePanel`) for help, an item's details, or the form
 * that adds or edits one item. No page renders a shell of its own.
 */
export const AppShell = ({
  sidebar,
  children,
  panelCloseLabel,
  notifications,
}: AppShellProps) => (
  <SidePanelProvider>
    <ShellLayout
      sidebar={sidebar}
      panelCloseLabel={panelCloseLabel}
      notifications={notifications}
    >
      {children}
    </ShellLayout>
  </SidePanelProvider>
);
