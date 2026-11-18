import {
  IconAlertCircle,
  IconAlertTriangle,
  IconCheck,
  IconInfoCircle,
  IconX,
} from '@tabler/icons-react';
import type { ReactNode } from 'react';

import { IconButton } from '../../aria/iconbutton/index.js';
import type { StatusTone } from '../../internal/statustone.js';
import { alertStyles } from './styles.js';

export type { StatusTone };

export type AlertProps = {
  /** What the notice means: a failure (`error`), something to attend to (`warning`), an outcome (`success`), information (`info`, the default), or a plain note (`neutral`). */
  tone?: StatusTone;
  /** A short heading, when the words need one. */
  title?: ReactNode;
  /** The words of the notice. */
  children?: ReactNode;
  /** The notice's actions, such as Retry: buttons under the words. */
  actions?: ReactNode;
  /** An icon in place of the tone's own, such as a mark that says more than the tone does. */
  icon?: ReactNode;
  /** Layout only, such as a margin; merged last, so it wins over the notice's own classes. */
  className?: string;
} & (
  | { onDismiss?: undefined; closeLabel?: undefined }
  | {
      /**
       * Shows a round close control that calls this; the caller then removes the notice. Any tone may
       * be dismissed: whether a notice offers it is the caller's call, made by passing `onDismiss`
       * or not (a failure that should stay until the next attempt simply gets none). The close
       * control holds the focus when it is pressed, and leaves with the notice, so the caller moves
       * the focus to a place that stays: the heading of what the notice was about, or the control
       * that started what it reports.
       */
      onDismiss: () => void;
      /** The close control's name, such as "Dismiss", as a dialog's `closeLabel`: it shows only an icon. */
      closeLabel: string;
    }
);

/** The icon a tone leads with, when the caller gives none. */
const toneIcon = (tone: StatusTone): ReactNode => {
  switch (tone) {
    case 'success':
      return <IconCheck aria-hidden />;
    case 'warning':
      return <IconAlertTriangle aria-hidden />;
    case 'error':
      return <IconAlertCircle aria-hidden />;
    case 'info':
    case 'neutral':
      return <IconInfoCircle aria-hidden />;
  }
};

/**
 * The one in-page notice: a failure, a warning, information, or an outcome, with its icon, its
 * surface, its live-region role, and its action area, so every notice reads alike. A warning or a
 * failure is announced as an alert; information, a success, or a neutral note as a status.
 */
export const Alert = ({
  tone = 'info',
  title,
  children,
  actions,
  icon,
  className,
  onDismiss,
  closeLabel,
}: AlertProps) => {
  const styles = alertStyles({ tone, hasClose: onDismiss !== undefined });
  return (
    <div
      role={tone === 'warning' || tone === 'error' ? 'alert' : 'status'}
      className={styles.root({ className })}
    >
      <div aria-hidden className={styles.icon()}>
        {icon ?? toneIcon(tone)}
      </div>
      <div className={styles.main()}>
        {title !== undefined && <div className={styles.title()}>{title}</div>}
        {children !== undefined && (
          <div className={styles.text()}>{children}</div>
        )}
        {actions !== undefined && (
          <div className={styles.actions()}>{actions}</div>
        )}
      </div>
      {onDismiss !== undefined && (
        <IconButton
          size='sm'
          radius='full'
          aria-label={closeLabel}
          onPress={onDismiss}
          className={styles.close()}
        >
          <IconX aria-hidden className='size-4' />
        </IconButton>
      )}
    </div>
  );
};
