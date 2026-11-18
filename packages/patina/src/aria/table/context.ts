import { createContext } from 'react';

import type { EmptyStateProps } from '../../emptystate/index.js';

/** What the body shows while it has no rows, which the table is given and its body draws. */
type BodyStatus = Readonly<{
  emptyState: EmptyStateProps;
  pendingText: string | undefined;
  hasFailed: boolean;
}>;

export const BodyStatusContext = createContext<BodyStatus | null>(null);
