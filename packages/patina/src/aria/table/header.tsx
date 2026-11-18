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
  base: 'bg-neutral text-neutral-foreground border-surface-border border-b',
});

/**
 * The selection column's width: a mark and a cell's padding. React Aria lays it out at this width in
 * a resizable table, which it never resizes; any other table takes it as the heading's CSS.
 */
const SELECTION_COLUMN_WIDTH = 48;

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
          width={SELECTION_COLUMN_WIDTH}
          minWidth={SELECTION_COLUMN_WIDTH}
          maxWidth={SELECTION_COLUMN_WIDTH}
          style={{ width: SELECTION_COLUMN_WIDTH }}
          className={(renderProps) => tableColumnStyles(renderProps).base()}
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
