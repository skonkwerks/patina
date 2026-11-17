import type { ReactNode } from 'react';
import {
  GridListHeader as AriaGridListHeader,
  GridListSection as AriaGridListSection,
  type GridListSectionProps as AriaGridListSectionProps,
} from 'react-aria-components';
import { tv } from 'tailwind-variants';

import { Count } from '../count.tsx';

export const gridListSectionStyles = tv({
  slots: {
    root: 'flex flex-col',
    heading: 'flex items-center gap-2',
    count: 'text-surface-foreground-muted',
    header:
      'bg-surface text-surface-foreground-muted border-surface-border sticky top-0 z-10 border-b px-4 py-2 text-xs font-medium',
  },
  variants: {
    layout: {
      // In a list of rows a line stands above every section after the first, as between two rows;
      // the heading's own line stands above the section's first row, which therefore draws none;
      // and only the last row of the last section takes the frame's rounding.
      stack: {
        root: 'border-surface-border [&:not(:last-child)>[role=row]:nth-last-child(1_of_[role=row])]:rounded-b-none [&>[role=row]:nth-child(2)]:border-t-0 [[role=rowgroup]+&]:border-t',
      },
      // In a grid layout the section takes the list's columns, so a column lines up across sections.
      grid: {
        root: 'col-span-full grid grid-cols-subgrid gap-3',
        header: 'col-span-full',
      },
    },
  },
  defaultVariants: { layout: 'stack' },
});

export type GridListSectionProps<T extends object> = Omit<
  AriaGridListSectionProps<T>,
  'className' | 'children'
> & {
  /** The section's heading, shown above its items; it also names the section. */
  title: string;
  /** A muted count after the title, formatted by the caller from the vocabulary, such as `(3)`; part of the section's name, as a page's count is part of its heading. */
  count?: string;
  /** Chips after the title: the section's state, such as a default. Never a control: a section header is not reachable by keyboard. */
  tags?: ReactNode;
  /** `grid` in a `GridList` with `layout='grid'`, so the section's items share the list's columns. */
  layout?: 'stack' | 'grid';
  children: ReactNode;
};

/**
 * A titled group of items inside a `GridList`. React Aria marks sections in a grid list as alpha:
 * the API may still change, so every use goes through this wrapper.
 */
export const GridListSection = <T extends object>({
  title,
  count,
  tags,
  layout,
  children,
  ...rest
}: GridListSectionProps<T>) => {
  const styles = gridListSectionStyles({ layout });
  return (
    <AriaGridListSection {...rest} className={styles.root()}>
      <AriaGridListHeader className={styles.header()}>
        <span className={styles.heading()}>
          <span>
            {title}
            {count !== undefined && (
              <Count text={count} className={styles.count()} />
            )}
          </span>
          {tags}
        </span>
      </AriaGridListHeader>
      {children}
    </AriaGridListSection>
  );
};
