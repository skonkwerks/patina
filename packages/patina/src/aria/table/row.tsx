import {
  Collection,
  Row as AriaRow,
  type RowProps as AriaRowProps,
  useTableOptions,
} from 'react-aria-components';
import { tv } from 'tailwind-variants';

import { itemStateStyles } from '../../internal/itemstate.js';
import { SelectionCheckbox } from '../../internal/selectioncheckbox.js';
import { Cell } from './cell.js';

export const tableRowStyles = tv({
  // The shared item states (`internal/itemstate.ts`): the focus ring inside the row, the hover and
  // selected fills, and the disabled look. A selected row's 2px primary bar, so that color is not
  // the only sign, stands at the start of its first cell, not as the row's start border, as a
  // `GridList`'s and a `Tree`'s rows draw it (`rowStateStyles`): a table's borders collapse, and
  // half of a start border would stand outside the columns, so a resizable table, whose columns
  // React Aria sizes to fill its scroller, would come out a pixel wider and scroll.
  extend: itemStateStyles,
  // The line is drawn above each row but the first, and not below each but the last.
  base: 'border-surface-border border-t first:border-t-0 [&>:first-child]:relative',
  compoundVariants: [
    {
      isSelected: true,
      class:
        '[&>:first-child]:before:bg-primary [&>:first-child]:before:absolute [&>:first-child]:before:inset-y-0 [&>:first-child]:before:start-0 [&>:first-child]:before:w-0.5 forced-colors:[&>:first-child]:before:bg-[Highlight]',
    },
    // The hover comes from React Aria, which a row has only where a press does something, so a
    // row that does nothing never lights up. A compound variant rather than a second `isHovered`:
    // an extending style that defines a boolean variant again loses its boolean type in
    // tailwind-variants 3.3.1.
    { isHovered: true, class: 'cursor-pointer' },
  ],
});

export type RowProps<T extends object> = Omit<AriaRowProps<T>, 'className'>;

/**
 * One row of a `Table`. In a table whose selection toggles (`selectionMode` with the default
 * `selectionBehavior`), it leads with its selection mark in the header's selection column: a
 * checkbox when several rows can be selected, a round mark when one can. A press on its mark adds
 * the row to the selection or takes it out; a press on the row does the same, except in a table
 * with a row action and nothing selected, where it runs the action. The focus moves into the mark
 * from its cell, also when the table moves by Tab.
 */
export const Row = <T extends object>({
  columns,
  children,
  ...rest
}: RowProps<T>) => {
  const { selectionMode, selectionBehavior } = useTableOptions();
  return (
    <AriaRow {...rest} className={(renderProps) => tableRowStyles(renderProps)}>
      {selectionBehavior === 'toggle' && (
        <Cell focusMode='child' allowsArrowNavigation>
          <SelectionCheckbox
            mark={selectionMode === 'single' ? 'radio' : 'check'}
          />
        </Cell>
      )}
      <Collection items={columns}>{children}</Collection>
    </AriaRow>
  );
};
