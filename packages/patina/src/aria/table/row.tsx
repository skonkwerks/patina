import {
  Row as AriaRow,
  type RowProps as AriaRowProps,
} from 'react-aria-components';
import { tv } from 'tailwind-variants';

import { focusRing } from '../../internal/focus.js';

export const tableRowStyles = tv({
  extend: focusRing,
  // The line is drawn above each row but the first, and not below each but the last: a paged
  // table ends with React Aria's load-more row, so no row of the data is ever the last child.
  base: 'border-surface-border border-t outline-offset-[-2px] first:border-t-0',
  variants: {
    // The hover comes from React Aria, which a row has only where a press does something, so a
    // row that does nothing never lights up.
    isHovered: { true: 'bg-surface-hover cursor-pointer' },
  },
});

export type RowProps<T extends object> = Omit<AriaRowProps<T>, 'className'>;

export const Row = <T extends object>(props: RowProps<T>) => (
  <AriaRow
    {...props}
    className={(renderProps) => tableRowStyles(renderProps)}
  />
);
