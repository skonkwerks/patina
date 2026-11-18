import {
  Column as AriaColumn,
  type ColumnProps as AriaColumnProps,
} from 'react-aria-components';
import { tv } from 'tailwind-variants';

import { focusRing } from '../../internal/focus.js';
import { type Align, align } from './align.js';

export const tableColumnStyles = tv({
  extend: focusRing,
  base: 'px-4 py-3 align-middle text-xs font-medium whitespace-nowrap',
  variants: {
    align,
    // Shares of the table's width, so that every column gives way together in a narrow place;
    // a column with no size shares what the sized ones leave.
    // `xs` is for a short value that never grows, such as a number of two digits.
    width: { xs: 'w-[8%]', sm: 'w-[12%]', md: 'w-[18%]', lg: 'w-[24%]' },
  },
  defaultVariants: { align: 'start' },
});

export type ColumnProps = Omit<
  AriaColumnProps,
  'className' | 'children' | 'width' | 'minWidth' | 'maxWidth' | 'defaultWidth'
> & {
  children: string;
  /** `end` for a column of numbers, so their digits line up. */
  align?: Align;
  /** How much of the table's width the column takes. Left out, it shares what the sized columns leave. */
  width?: 'xs' | 'sm' | 'md' | 'lg';
};

export const Column = ({ children, align, width, ...rest }: ColumnProps) => (
  <AriaColumn
    {...rest}
    className={(renderProps) =>
      tableColumnStyles({ ...renderProps, align, width })
    }
  >
    {children}
  </AriaColumn>
);
