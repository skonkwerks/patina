import { use } from 'react';
import {
  Cell as AriaCell,
  type CellProps as AriaCellProps,
} from 'react-aria-components';
import { tv } from 'tailwind-variants';

import { focusRing } from '../../internal/focus.js';
import { type Align, align } from './align.js';
import { TableLookContext } from './context.js';

export const tableCellStyles = tv({
  extend: focusRing,
  base: 'px-4 align-middle outline-offset-[-2px]',
  variants: {
    align,
    allowsWrapping: { false: 'truncate' },
    isCompact: { false: 'py-3', true: 'py-1.5' },
  },
  defaultVariants: {
    align: 'start',
    allowsWrapping: false,
    isCompact: false,
  },
});

export type CellProps = Omit<AriaCellProps, 'className'> & {
  /** `end` for a number, so its digits line up with the column's. */
  align?: Align;
  /**
   * For a cell that holds more than a line of text, such as chips: its content wraps inside the
   * column. Left out, the table's `allowsWrapping` decides, and a table that doesn't wrap keeps the
   * cell to one line, cut where the column ends.
   */
  allowsWrapping?: boolean;
};

export const Cell = ({ align, allowsWrapping, ...rest }: CellProps) => {
  const look = use(TableLookContext);
  return (
    <AriaCell
      {...rest}
      className={(renderProps) =>
        tableCellStyles({
          ...renderProps,
          align,
          allowsWrapping: allowsWrapping ?? look.allowsWrapping,
          isCompact: look.isCompact,
        })
      }
    />
  );
};
