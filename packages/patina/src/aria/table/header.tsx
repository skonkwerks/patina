import {
  Collection,
  Column as AriaColumn,
  TableHeader as AriaTableHeader,
  type TableHeaderProps as AriaTableHeaderProps,
  useTableOptions,
} from 'react-aria-components';
import { tv } from 'tailwind-variants';

import { SelectionCheckbox } from '../../internal/selectioncheckbox.js';
import { tableColumnStyles } from './column.js';
import { SelectionColumnName } from './selectioncolumnname.js';

export const tableHeaderStyles = tv({
  // The 2px start edge every body row keeps for its selected bar (`rowStateStyles`), transparent
  // here: the table's borders collapse, so a header without it would start its cells 1px before
  // the body's, and a column's heading would not line up with its values.
  base: 'bg-neutral text-neutral-foreground border-surface-border border-s-2 border-b border-s-transparent',
});

/** The selection column's heading cell: a column's, as narrow as a mark and a cell's padding. */
export const tableSelectionColumnStyles = tv({
  extend: tableColumnStyles,
  base: 'w-12',
});

export type TableHeaderProps<T extends object> = Omit<
  AriaTableHeaderProps<T>,
  'className'
>;

/**
 * The table's header row. In a table whose selection toggles (`selectionMode` with the default
 * `selectionBehavior`), it leads with the selection column: a select-all checkbox when several rows
 * can be selected, and only the column's name, for assistive technology, when one can. The focus
 * moves into the column's checkbox from the keyboard, also when the table moves by Tab. React Aria
 * disables the select-all while the table has no rows (empty, or on its first read), and it then
 * looks disabled.
 */
export const TableHeader = <T extends object>({
  columns,
  children,
  ...rest
}: TableHeaderProps<T>) => {
  const { selectionMode, selectionBehavior } = useTableOptions();
  return (
    <AriaTableHeader {...rest} className={tableHeaderStyles()}>
      {selectionBehavior === 'toggle' && (
        <AriaColumn
          focusMode='child'
          allowsArrowNavigation
          className={(renderProps) => tableSelectionColumnStyles(renderProps)}
        >
          {selectionMode === 'multiple' ? (
            <SelectionCheckbox mark='check' fadesWhenDisabled isOnNeutral />
          ) : (
            <SelectionColumnName />
          )}
        </AriaColumn>
      )}
      <Collection items={columns}>{children}</Collection>
    </AriaTableHeader>
  );
};
