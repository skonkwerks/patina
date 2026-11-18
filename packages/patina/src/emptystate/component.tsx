import type { ReactNode } from 'react';

import { emptyStateStyles } from './styles.js';

export type EmptyStateProps = {
  /** What is empty, as a short statement: "No models registered". */
  title: string;
  /** What will appear here and what to do next, one line. It never implies an error. */
  description?: string;
  /** The relevant next actions, such as the button that creates the first item. */
  actions?: ReactNode;
};

/**
 * The one empty state: a title, an optional line of guidance, and optional actions, centered. It
 * draws no frame of its own; the collection that is empty (a `GridList`) provides the frame. Shown
 * only when a query has succeeded with nothing in it, never while loading or after a failure.
 */
export const EmptyState = ({
  title,
  description,
  actions,
}: EmptyStateProps) => {
  const styles = emptyStateStyles();
  return (
    <div className={styles.root()}>
      <p className={styles.title()}>{title}</p>
      {description && <p className={styles.description()}>{description}</p>}
      {actions && <div className={styles.actions()}>{actions}</div>}
    </div>
  );
};
