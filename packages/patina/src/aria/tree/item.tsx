import { IconCheck, IconChevronRight } from '@tabler/icons-react';
import type { ReactNode } from 'react';
import {
  Button,
  Checkbox,
  TreeItem as AriaTreeItem,
  TreeItemContent,
  type TreeItemProps as AriaTreeItemProps,
} from 'react-aria-components';
import { tv } from 'tailwind-variants';

import { checkMarkStyles } from '../../internal/checkmark.ts';
import { cn } from '../../internal/cn.ts';
import { focusRing } from '../../internal/focus.ts';
import { rowStateStyles } from '../../internal/itemstate.ts';

/**
 * A row of a `Tree`: 32px high, with the shared row states (`internal/itemstate.ts`) a `GridList`
 * row draws, so a selected row reads the same in both: its fill and its start bar. The start padding
 * is 2px less than the end's, for the edge that carries the bar, and only the end corners are
 * rounded, so the bar is a straight edge, as the navigation's marker is.
 */
export const treeItemStyles = tv({
  extend: rowStateStyles,
  base: 'text-surface-foreground relative flex min-h-8 cursor-default items-center gap-1 rounded-e-md ps-1.5 pe-2 text-sm select-none',
});

/**
 * The parts of a row. The chevron of a row with children, or the empty place of one without, is
 * indented one chevron's width for each level below the first, so the titles of a level line up and
 * the selection checkboxes stay in one column before them. The checkbox itself is the shared mark
 * (`checkMarkStyles`), at a list row's size.
 */
export const treeItemContentStyles = tv({
  slots: {
    // Positioned, so the hidden input React Aria puts inside the label stays over the mark.
    selection: 'relative me-1 flex shrink-0',
    toggle:
      'ms-[calc((var(--tree-item-level)_-_1)_*_var(--spacing)_*_5)] flex size-5 shrink-0 items-center justify-center rounded',
    chevron:
      'text-surface-foreground-muted size-4 transition-transform motion-reduce:transition-none',
    title: 'min-w-0 flex-1 truncate py-1',
  },
  variants: {
    isExpanded: { true: { chevron: 'rotate-90' } },
  },
});

export type TreeItemProps = Omit<
  AriaTreeItemProps,
  'className' | 'style' | 'children' | 'textValue'
> & {
  /** The row's text: what it shows, its accessible name, and what typing a few letters matches. */
  title: string;
  /** The rows nested under this one: `TreeItem`s, or a `Collection` of them. */
  children?: ReactNode;
};

/**
 * One row of a `Tree`, with the rows nested under it as its children. A row with children shows a
 * chevron that opens and closes it under the pointer; React Aria names the chevron and keeps it out
 * of the Tab order, since Right and Left open and close the row from the keyboard. In a tree whose
 * selection toggles (the default `selectionBehavior`), the row leads with its selection checkbox,
 * which React Aria names and ties to the row; Right on a row with no children moves the focus into
 * it, and Left back to the row.
 */
export const TreeItem = ({ title, children, ...rest }: TreeItemProps) => (
  <AriaTreeItem
    {...rest}
    textValue={title}
    className={(renderProps) => treeItemStyles(renderProps)}
  >
    <TreeItemContent>
      {({ selectionMode, selectionBehavior, hasChildItems, isExpanded }) => {
        const styles = treeItemContentStyles({ isExpanded });
        return (
          <>
            {selectionMode !== 'none' && selectionBehavior === 'toggle' && (
              <Checkbox slot='selection' className={styles.selection()}>
                {/* Right on a row with no children moves the focus into its checkbox, so the
                  checkbox draws the focus ring then, in the row's place. */}
                {({ isFocusVisible, isSelected }) => {
                  // A row's 14px title takes the list row's 16px mark, as MultiSelect's options do.
                  const mark = checkMarkStyles({ size: 'sm', isSelected });
                  return (
                    <span
                      className={cn(mark.box(), focusRing({ isFocusVisible }))}
                    >
                      <IconCheck
                        aria-hidden
                        className={mark.check()}
                        strokeWidth={2.5}
                      />
                    </span>
                  );
                }}
              </Checkbox>
            )}
            {hasChildItems ? (
              <Button slot='chevron' className={styles.toggle()}>
                <IconChevronRight aria-hidden className={styles.chevron()} />
              </Button>
            ) : (
              <span aria-hidden className={styles.toggle()} />
            )}
            <span className={styles.title()}>{title}</span>
          </>
        );
      }}
    </TreeItemContent>
    {children}
  </AriaTreeItem>
);
