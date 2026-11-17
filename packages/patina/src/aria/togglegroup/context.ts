import { createContext } from 'react';

import type { ToggleStyleProps } from './styles.ts';

/** What a group gives its toggles: that they are segments, and the group's size. */
export const GroupContext = createContext<{
  isInGroup: boolean;
  size: ToggleStyleProps['size'];
}>({ isInGroup: false, size: undefined });
