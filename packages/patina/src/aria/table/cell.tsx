import {
  Cell as AriaCell,
  type CellProps as AriaCellProps,
} from 'react-aria-components';
import { tv } from 'tailwind-variants';

import { focusRing } from '../../internal/focus.ts';
import { type Align, align } from './align.ts';

export const tableCellStyles = tv({
  extend: focusRing,
  base: 'px-4 py-3 align-middle outline-offset-[-2px]',
  variants: {
    align,
    allowsWrapping: { false: 'truncate' },
  },
  defaultVariants: { align: 'start', allowsWrapping: false },
});

export type CellProps = Omit<AriaCellProps, 'className'> & {
  /** `end` for a number, so its digits line up with the column's. */
  align?: Align;
  /**
   * For a cell that holds more than a line of text, such as chips: its content wraps inside the
   * column. Left out, the cell is one line, cut where the column ends.
   */
  allowsWrapping?: boolean;
};

export const Cell = ({ align, allowsWrapping = false, ...rest }: CellProps) => (
  <AriaCell
    {...rest}
    className={(renderProps) =>
      tableCellStyles({ ...renderProps, align, allowsWrapping })
    }
  />
);
