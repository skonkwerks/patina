import { createContext, use } from 'react';

/** Whether the open dialog may be dismissed; `DialogModal` provides it, the close control and `DialogCancel` read it. */
export const DismissDisabledContext = createContext(false);

/**
 * Whether the dialog this is rendered in is held open by `DialogModal`'s `isDismissDisabled`, which
 * is set while a write started from it is pending. A control inside the dialog that shows that
 * write, such as `Confirmation`'s action with its spinner, reads it here, so the caller states the
 * pending state once, on the modal.
 */
export const useIsDismissDisabled = (): boolean => use(DismissDisabledContext);

/** Where the open dialog stands; `DialogModal` provides it, and `Dialog` lays out its header and body by it. */
export const DialogPlacementContext = createContext<'center' | 'right'>(
  'center',
);
