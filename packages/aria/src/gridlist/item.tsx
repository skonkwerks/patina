import type { Ref } from 'react';
import {
  composeRenderProps,
  GridListItem as AriaGridListItem,
  type GridListItemProps as AriaGridListItemProps,
} from 'react-aria-components';
import { tv } from 'tailwind-variants';

import { focusRing } from '../focus.ts';

export const gridListItemStyles = tv({
  extend: focusRing,
  // A line stands between two rows, drawn above the second, and the last row takes the frame's
  // rounding by being the last of the rows: a paged list ends with React Aria's load-more
  // element, so no item is ever the last child, and a rule that looks for one never applies.
  base: 'border-surface-border text-surface-foreground relative flex cursor-default gap-3 px-4 py-3 text-sm -outline-offset-2 select-none first:rounded-t-lg [&:nth-last-child(1_of_[role=row])]:rounded-b-lg [[role=row]+&]:border-t',
  variants: {
    // The selected fills are light enough for the subtle text and the chips a row holds to keep their
    // contrast on them; an app should check text contrast on these two fills.
    isSelected: { false: '', true: 'bg-primary/10' },
    isHovered: { true: '', false: '' },
    isDisabled: {
      true: 'text-surface-foreground-muted forced-colors:text-[GrayText]',
    },
  },
  // The hover comes from React Aria, which a row has only where a press does something, so a row
  // that does nothing never lights up.
  compoundVariants: [
    { isSelected: false, isHovered: true, class: 'bg-surface-hover' },
    { isSelected: true, isHovered: true, class: 'bg-primary/12' },
  ],
});

export type GridListItemProps = AriaGridListItemProps & {
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
    className={composeRenderProps(className, (cls, renderProps) =>
      gridListItemStyles({ ...renderProps, className: cls }),
    )}
  >
    {children}
  </AriaGridListItem>
);
