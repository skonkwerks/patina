import { IconX } from '@tabler/icons-react';
import {
  Button as AriaButton,
  Text,
  UNSTABLE_Toast as AriaToast,
  UNSTABLE_ToastContent as AriaToastContent,
  UNSTABLE_ToastRegion as AriaToastRegion,
} from 'react-aria-components';
import { tv } from 'tailwind-variants';

import { focusRing } from '../../internal/focus.ts';
import { iconButtonStyles } from '../iconbutton/index.ts';
import { toastQueue } from './queue.ts';
import StatusIcon from './statusicon.tsx';

export const toastRegionStyles = tv({
  base: 'pointer-events-none fixed right-4 bottom-4 z-[100] flex w-96 max-w-[calc(100vw-2rem)] flex-col gap-2 transition-[right] duration-200 motion-reduce:transition-none',
});

/** One toast's frame, which carries the shared focus ring and its status's border. */
export const toastStyles = tv({
  extend: focusRing,
  base: 'bg-overlay text-overlay-foreground pointer-events-auto grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3 rounded-lg border p-3 shadow-lg',
  variants: {
    status: {
      info: 'border-info-tint/40',
      success: 'border-success-tint/40',
    },
  },
});

/** The parts inside a toast. */
export const toastContentStyles = tv({
  slots: {
    iconFrame: 'mt-0.5',
    icon: 'h-5 w-5',
    content: 'min-w-0',
    title: 'block text-sm font-medium',
    description: 'text-overlay-foreground-muted mt-1 block text-sm',
    closeIcon: 'h-4 w-4',
  },
  variants: {
    status: {
      info: { icon: 'text-info' },
      success: { icon: 'text-success' },
    },
  },
});

export type ToastRegionProps = {
  /** Placement overrides, such as a `right-*` that stands clear of a side panel. */
  className?: string;
};

/**
 * The app's notification area, bottom right: the toasts in the queue, newest on top, each
 * closable. An app with a panel at the right edge moves the area beside it through `className`
 * (for example `right-[calc(var(--side-panel-width)+1rem)]`), so a toast never covers the panel's
 * buttons.
 */
export const ToastRegion = ({ className }: ToastRegionProps) => {
  return (
    // React Aria names the region ("N notifications") and each close button ("Close") itself.
    <AriaToastRegion
      queue={toastQueue}
      className={toastRegionStyles({ className })}
    >
      {({ toast }) => {
        const status = toast.content.status ?? 'info';
        const styles = toastContentStyles({ status });
        return (
          <AriaToast
            toast={toast}
            className={(renderProps) => toastStyles({ ...renderProps, status })}
          >
            <div aria-hidden className={styles.iconFrame()}>
              <StatusIcon status={status} className={styles.icon()} />
            </div>
            <AriaToastContent className={styles.content()}>
              <Text slot='title' className={styles.title()}>
                {toast.content.title}
              </Text>
              {toast.content.description && (
                <Text slot='description' className={styles.description()}>
                  {toast.content.description}
                </Text>
              )}
            </AriaToastContent>
            {/* React Aria names the close button ("Close") through its slot. */}
            <AriaButton
              slot='close'
              className={(renderProps) =>
                iconButtonStyles({
                  ...renderProps,
                  variant: 'ghost',
                  size: 'sm',
                  radius: 'full',
                })
              }
            >
              <IconX aria-hidden className={styles.closeIcon()} />
            </AriaButton>
          </AriaToast>
        );
      }}
    </AriaToastRegion>
  );
};
