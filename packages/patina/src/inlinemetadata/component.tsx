import type { ReactNode } from 'react';

import { inlineMetadataStyles } from './styles.js';

export type InlineMetadataItem = Readonly<{
  /** Stable within the line, such as the property the value shows. */
  id: string;
  /** Text from the vocabulary or the data, or an element that renders one, such as a price or a `code` command. */
  value: ReactNode;
}>;

export type InlineMetadataProps = {
  /** The values, in order. */
  items: readonly InlineMetadataItem[];
  /** `sm` (the default) under a row's title; `md` is body size, for a line that stands on its own. */
  size?: 'sm' | 'md';
  className?: string;
};

/**
 * One line of muted metadata values under a row's title, never wrapping (each value is cut where
 * it runs out of room), separated by a spaced pipe, the one separator
 * the guidelines allow between adjacent values. The values are a list, so assistive technology reads
 * them as separate items; the pipe is decorative and hidden from it.
 */
export const InlineMetadata = ({
  items,
  size = 'sm',
  className,
}: InlineMetadataProps) => {
  const styles = inlineMetadataStyles({ size });
  return (
    // `role='list'` keeps list semantics in Safari, which drops them from a list styled without bullets.
    <ul role='list' className={styles.root({ className })}>
      {items.map(({ id, value }, index) => (
        <li key={id} className={styles.item()}>
          {index > 0 && <span aria-hidden>|</span>}
          <span className={styles.value()}>{value}</span>
        </li>
      ))}
    </ul>
  );
};
