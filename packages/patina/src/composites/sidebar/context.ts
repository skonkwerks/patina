import { createContext, use } from 'react';

/** What the sidebar tells its contents. */
export type SidebarState = Readonly<{
  /** The sidebar is the collapsed rail: names are visually hidden, and each item's is its tooltip. */
  isCollapsed: boolean;
}>;

export const SidebarContext = createContext<SidebarState>({
  isCollapsed: false,
});

/**
 * Whether the sidebar around the caller is collapsed, for contents that adapt to the rail: an
 * app's footer controls hide their words or step aside there. Outside a `Sidebar` it is open.
 */
export const useSidebar = (): SidebarState => use(SidebarContext);
