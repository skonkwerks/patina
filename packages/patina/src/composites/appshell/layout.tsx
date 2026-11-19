import type { ReactNode } from 'react';

import { SidePanel } from '../sidepanel/index.js';
import { appShellStyles } from './styles.js';

type ShellLayoutProps = {
  sidebar: ReactNode;
  children: ReactNode;
  panelCloseLabel: string;
  notifications?: ReactNode;
};

/** The shell's layout, inside the side panel's provider. */
const C = ({
  sidebar,
  children,
  panelCloseLabel,
  notifications,
}: ShellLayoutProps) => {
  const styles = appShellStyles();
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
