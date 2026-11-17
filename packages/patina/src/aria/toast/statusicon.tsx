import { IconCheck, IconInfoCircle } from '@tabler/icons-react';

import type { ToastStatus } from './queue.ts';

type StatusIconProps = {
  status: ToastStatus;
  /** The icon's size and color, from the toast content's `icon` slot. */
  className: string;
};

/** A sidecar of `ToastRegion`, private to the toast family: the icon that leads a toast of a status. */
const C = ({ status, className }: StatusIconProps) => {
  switch (status) {
    case 'success':
      return <IconCheck aria-hidden className={className} />;
    case 'info':
      return <IconInfoCircle aria-hidden className={className} />;
  }
};

C.displayName = 'StatusIcon';
export default C;
