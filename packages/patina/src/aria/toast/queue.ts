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

/** How many toasts show at once; the rest wait in the queue. */
const MAX_VISIBLE_TOASTS = 3;

/** How long a toast stays when the app gives no time of its own. */
export const DEFAULT_TOAST_TIMEOUT_MS = 5_000;

export type ShowToastOptions = {
  /** How long the toast stays before it dismisses itself, in milliseconds. */
  timeout?: number;
};

/** The one queue the region renders. Any module can add to it; the shell shows it. */
export const toastQueue = new ToastQueue<ToastContent>({
  maxVisibleToasts: MAX_VISIBLE_TOASTS,
});

/**
 * Shows a success or an informational notification, which dismisses itself after `timeout`
 * (`DEFAULT_TOAST_TIMEOUT_MS` unless the app says otherwise).
 */
export const showToast = (
  content: ToastContent,
  { timeout = DEFAULT_TOAST_TIMEOUT_MS }: ShowToastOptions = {},
): string => toastQueue.add(content, { timeout });
