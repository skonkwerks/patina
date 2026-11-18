import type { ReactNode } from 'react';

import { SidePanel, useSidePanelState } from '../sidepanel/index.ts';
import { appShellStyles } from './styles.ts';

type ShellLayoutProps = {
  sidebar: ReactNode;
  children: ReactNode;
  panelCloseLabel: string;
  notifications?: ReactNode;
};

/**
 * The shell's layout, inside the side panel's provider, where it can read whether the panel is
 * open and set `--side-panel-offset` for what stands at the right edge.
 */
const C = ({
  sidebar,
  children,
  panelCloseLabel,
  notifications,
}: ShellLayoutProps) => {
  const { isOpen } = useSidePanelState();
  const styles = appShellStyles({ isPanelOpen: isOpen });
  return (
    <div className={styles.root()}>
      {sidebar}
      <main className={styles.main()}>{children}</main>
      <SidePanel closeLabel={panelCloseLabel} />
      {notifications}
    </div>
  );
};

C.displayName = 'ShellLayout';
export default C;
