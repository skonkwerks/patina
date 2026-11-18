import type { ReactNode } from 'react';

import { propertyListStyles } from './styles.js';

export type PropertyListItem = Readonly<{
  /** Stable within the list, such as the property's field name; the row's identity. */
  id: string;
  /** The property's name, in words. */
  label: string;
  /** The value: text, or an element such as a link or a chip. Empty (`''`, `null`, or left out) shows `emptyValue`. */
  value?: ReactNode;
}>;

export type PropertyListProps = {
  items: readonly PropertyListItem[];
  /** What a property with no value shows, such as "None", so an empty value is said rather than left blank. */
  emptyValue: string;
  /** `horizontal` (the default): label beside value; `stacked`: label above value, for a narrow panel. */
  layout?: 'horizontal' | 'stacked';
  /** Layout only, such as a width or a margin. */
  className?: string;
};

/**
 * A description list of a thing's properties: each label is a term (`dt`) and each value its
 * description (`dd`), so assistive technology reads every pair together.
 */
export const PropertyList = ({
  items,
  emptyValue,
  layout,
  className,
}: PropertyListProps) => {
  const styles = propertyListStyles({ layout });
  return (
    <dl className={styles.root({ className })}>
      {items.map((item) => (
        <div key={item.id} className={styles.row()}>
          <dt className={styles.label()}>{item.label}</dt>
          <dd className={styles.value()}>
            {item.value === undefined ||
            item.value === null ||
            item.value === '' ? (
              <span className={styles.empty()}>{emptyValue}</span>
            ) : (
              item.value
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
};
