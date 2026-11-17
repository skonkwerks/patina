import type { Ref } from 'react';
import {
  GridListItem as AriaGridListItem,
  type GridListItemProps as AriaGridListItemProps,
} from 'react-aria-components';
import { tv } from 'tailwind-variants';

import { DISABLED } from '../../internal/disabled.ts';
import { focusRing } from '../../internal/focus.ts';
import {
  gridListDropTargetOutline,
  gridListRowDropLine,
} from './dropindicator.tsx';

export const gridListItemStyles = tv({
  extend: focusRing,
  // A line stands between two rows, drawn above every row after the first, and the first and last
  // rows take the frame's rounding by being the first and last of the rows: a paged list ends with
  // React Aria's load-more element, so no item is ever the last child, and a rule that looks for
  // one never applies. "The rows" are the items, which carry `data-key`: React Aria's drop
  // indicator rows do not, so they never move a row's rounding or divider while one is shown.
  base: [
    'border-surface-border text-surface-foreground relative flex cursor-default gap-3 px-4 py-3 text-sm -outline-offset-2 select-none [&:nth-child(1_of_[role=row][data-key])]:rounded-t-lg [&:nth-last-child(1_of_[role=row][data-key])]:rounded-b-lg [[role=row][data-key]~&]:border-t',
    gridListRowDropLine,
  ],
  variants: {
    // The selected fills are light enough for the subtle text and the chips a row holds to keep their
    // contrast on them; an app should check text contrast on these two fills.
    isSelected: { false: '', true: 'bg-primary/10' },
    isHovered: { true: '', false: '' },
    isDisabled: { true: [DISABLED, 'forced-colors:text-[GrayText]'] },
    // A drop onto the row draws `gridListDropTargetOutline` (dropindicator.tsx); a drop between rows
    // draws the insertion line instead.
    // Its classes are a compound variant below, so they come after the focus ring's `outline-0`;
    // while a drop is over a focused item, the dashed outline stands in for the focus ring.
    isDropTarget: { true: '', false: '' },
  },
  // The hover comes from React Aria, which a row has only where a press does something, so a row
  // that does nothing never lights up.
  compoundVariants: [
    {
      isDropTarget: true,
      class: gridListDropTargetOutline,
    },
    { isSelected: false, isHovered: true, class: 'bg-surface-hover' },
    { isSelected: true, isHovered: true, class: 'bg-primary/12' },
  ],
});

export type GridListItemProps = Omit<AriaGridListItemProps, 'className'> & {
  /** Layout only. */
  className?: string;
  ref?: Ref<HTMLDivElement>;
};

/** One unit in a `GridList`. Pass `textValue` when the children are not plain text, for typeahead and the item's name. */
export const GridListItem = ({
  ref,
  children,
  className,
  textValue,
  ...rest
}: GridListItemProps) => (
  <AriaGridListItem
    {...rest}
    ref={ref}
    textValue={
      textValue ?? (typeof children === 'string' ? children : undefined)
    }
    className={(renderProps) =>
      gridListItemStyles({ ...renderProps, className })
    }
  >
    {children}
  </AriaGridListItem>
);
