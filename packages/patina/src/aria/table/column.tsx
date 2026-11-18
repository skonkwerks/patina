import {
  IconCaretDown,
  IconCaretDownFilled,
  IconCaretUpFilled,
} from '@tabler/icons-react';
import { use } from 'react';
import {
  Column as AriaColumn,
  type ColumnProps as AriaColumnProps,
  ColumnResizer,
  type SortDirection,
} from 'react-aria-components';
import { tv } from 'tailwind-variants';

import { focusRing } from '../../internal/focus.js';
import { type Align, align } from './align.js';
import { ColumnResizingContext } from './context.js';

/** The narrowest a column of a resizable table gets unless it says otherwise: Cloudscape's 120px. */
const RESIZABLE_MIN_WIDTH = 120;

export const tableColumnStyles = tv({
  // The heading's classes are the top-level `base`, beside the `title` slot: in tailwind-variants
  // 3.3.1 a slot named `base` would drop `focusRing`'s base, and with it the shared ring's color.
  extend: focusRing,
  // Positioned, for the resizer at its end edge.
  base: 'relative px-4 py-3 align-middle text-xs font-medium whitespace-nowrap',
  slots: {
    // Cut where the column ends, which a resizable column can be dragged narrower than its text.
    title: 'block truncate',
    // At the heading's end whatever the column's alignment, as Cloudscape's, clear of the resizer.
    sortMark:
      'pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2',
  },
  variants: {
    align,
    // A sortable heading is pressed to sort: it keeps room at its end for the sort mark, and takes
    // the neutral fill's hover, as a neutral button does.
    allowsSorting: { true: 'cursor-pointer pe-9' },
    isHovered: { true: 'bg-neutral-hover' },
  },
  defaultVariants: { align: 'start' },
});

/**
 * The resizer at the end edge of a resizable column's heading: a line in the header's text color,
 * which turns primary and wider while it is hovered or dragged. It stands half over the next
 * heading, so the pointer finds it on either side of the line, and takes no touch scrolling. The
 * last column's stands inside the table, 2px in from its end, so it adds nothing to the table's
 * width to scroll, and its focus ring ends at the frame's edge.
 */
export const columnResizerStyles = tv({
  extend: focusRing,
  base: 'before:bg-neutral-foreground absolute inset-y-0 -end-1 z-10 flex w-2 cursor-col-resize touch-none justify-center outline-offset-0 before:my-2.5 before:w-px in-[th:last-child]:end-0.5',
  variants: {
    isHovered: { true: 'before:bg-primary before:w-0.5' },
    isResizing: { true: 'before:bg-primary before:w-0.5' },
  },
});

/** A size as CSS: a number is pixels, a percentage stays one; an `fr` share needs a resizable table. */
const cssSize = (size: AriaColumnProps['width'] | undefined) => {
  if (typeof size === 'number') {
    return `${String(size)}px`;
  }
  if (size === null || size === undefined || size.endsWith('fr')) {
    return undefined;
  }
  return size.endsWith('%') ? size : `${size}px`;
};

/**
 * The mark at a sortable heading's end, as Cloudscape's: an outlined caret while the column is not
 * the one sorted, a filled caret pointing up while it is sorted ascending, and down while
 * descending. The heading's `aria-sort` states the same to assistive technology.
 */
const sortMark = (direction: SortDirection | undefined, className: string) => {
  if (direction === 'ascending') {
    return <IconCaretUpFilled className={className} aria-hidden />;
  }
  if (direction === 'descending') {
    return <IconCaretDownFilled className={className} aria-hidden />;
  }
  return <IconCaretDown className={className} aria-hidden />;
};

export type ColumnProps = Omit<
  AriaColumnProps,
  'className' | 'children' | 'style'
> & {
  children: string;
  /** `end` for a column of numbers, so their digits line up. */
  align?: Align;
};

/**
 * One column's heading. Its sizes are React Aria's, pixels as a number or a percentage. In a table
 * that is not resizable, each column is as wide as its content on one line: `width` sets a width
 * that a longer line still widens unless its cells allow wrapping, and `minWidth` one it keeps when
 * its content is narrower; a browser lays a table's columns out from their content, so nothing
 * there makes a column narrower than its line, and `maxWidth` applies only in a resizable table.
 * In a table with `allowsColumnResizing`, React Aria lays the columns out and the heading ends with
 * a resizer: a column can't be dragged narrower than its `minWidth` (Cloudscape's 120px unless it
 * says) or wider than its `maxWidth`; `defaultWidth` is where it starts while React Aria holds the
 * widths, `width` holds it in the app (with the table's `onResize`), and a column with neither
 * shares what the others leave, as an `fr` width does, so the last such column fills the frame.
 *
 * `allowsSorting` makes the heading a control that sorts by its column: pressed, or Enter or Space
 * while it has the focus. The first press sorts ascending and the next ones turn the direction
 * over, as Cloudscape's; the table's `sortDescriptor` and `onSortChange` hold the sort, and the app
 * sorts the rows. A sortable heading takes the focus itself, so in a resizable table Enter sorts
 * and the Right arrow moves into its resizer.
 */
export const Column = ({
  children,
  align,
  width,
  defaultWidth,
  minWidth,
  maxWidth,
  ...rest
}: ColumnProps) => {
  const isResizable = use(ColumnResizingContext);
  const styles = tableColumnStyles({ align });
  return (
    <AriaColumn
      {...rest}
      // React Aria focuses a heading's first control by default, which in a resizable table is the
      // resizer; a sortable heading is itself the control, so it takes the focus as a cell.
      focusMode={rest.focusMode ?? (rest.allowsSorting ? 'cell' : undefined)}
      textValue={rest.textValue ?? children}
      width={width}
      defaultWidth={defaultWidth}
      minWidth={isResizable ? (minWidth ?? RESIZABLE_MIN_WIDTH) : minWidth}
      maxWidth={maxWidth}
      // React Aria sizes a column only in a resizable table, so any other table gives the sizes to
      // the heading as CSS, which sizes the whole column. Not `maxWidth`: a browser widens a column
      // to its content whatever its heading's `max-width` says.
      style={
        isResizable
          ? undefined
          : {
              width: cssSize(width ?? defaultWidth),
              minWidth: cssSize(minWidth),
            }
      }
      className={(renderProps) =>
        tableColumnStyles({ ...renderProps, align }).base()
      }
    >
      {({ allowsSorting, sortDirection }) => (
        <>
          <span className={styles.title()}>{children}</span>
          {allowsSorting && sortMark(sortDirection, styles.sortMark())}
          {isResizable && (
            <ColumnResizer
              className={(renderProps) => columnResizerStyles(renderProps)}
            />
          )}
        </>
      )}
    </AriaColumn>
  );
};
