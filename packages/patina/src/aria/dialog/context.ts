import { createContext } from 'react';

/** Whether the open dialog may be dismissed; `DialogModal` provides it, the close control and `DialogCancel` read it. */
export const DismissDisabledContext = createContext(false);
