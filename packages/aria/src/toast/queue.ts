import { UNSTABLE_ToastQueue as ToastQueue } from 'react-aria-components';

/**
 * Toasts announce outcomes that need no action: a success, or information. A failure is never a
 * toast; it stays beside the control that started it or in its dialog.
 */
export type ToastStatus = 'info' | 'success';

export type ToastContent = {
  title: string;
  description?: string;
  status?: ToastStatus;
};

const AUTO_DISMISS_MS = 5_000;

/** The one queue the region renders. Any module can add to it; the shell shows it. */
export const toastQueue = new ToastQueue<ToastContent>({ maxVisibleToasts: 3 });

/** Shows a success or an informational notification; it dismisses itself after a few seconds. */
export const showToast = (content: ToastContent): string =>
  toastQueue.add(content, { timeout: AUTO_DISMISS_MS });
