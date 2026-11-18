import { IconCheck, IconInfoCircle } from '@tabler/icons-react';

import type { ToastTone } from './queue.js';

type StatusIconProps = {
  tone: ToastTone;
  /** The icon's size and color, from the toast content's `icon` slot. */
  className: string;
};

/** A sidecar of `ToastRegion`, private to the toast family: the icon that leads a toast of a tone. */
const C = ({ tone, className }: StatusIconProps) => {
  switch (tone) {
    case 'success':
      return <IconCheck aria-hidden className={className} />;
    case 'info':
      return <IconInfoCircle aria-hidden className={className} />;
  }
};

C.displayName = 'StatusIcon';
export default C;
