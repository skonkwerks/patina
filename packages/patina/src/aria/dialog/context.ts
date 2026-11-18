import { createContext } from 'react';

/** Whether the open dialog may be dismissed; `DialogModal` provides it, the close control and `DialogCancel` read it. */
export const DismissDisabledContext = createContext(false);

/** Where the open dialog stands; `DialogModal` provides it, and `Dialog` lays out its header and body by it. */
export const DialogPlacementContext = createContext<'center' | 'right'>(
  'center',
);
