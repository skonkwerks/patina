import {
  Tree as AriaTree,
  type TreeProps as AriaTreeProps,
} from 'react-aria-components';
import { tv } from 'tailwind-variants';

import { focusRing } from '../../internal/focus.ts';

/**
 * The tree's frame on a surface. It carries the shared focus ring for when it holds the focus
 * itself, which it does only while it is empty; otherwise the focus is on a row.
 */
export const treeStyles = tv({
  extend: focusRing,
  base: 'bg-surface border-surface-border flex flex-col overflow-auto rounded-lg border p-1 -outline-offset-1',
});

export type TreeProps<T extends object> = Omit<
  AriaTreeProps<T>,
  'className'
> & {
  /** What the tree holds; every tree has an accessible name. */
  'aria-label': string;
  /** Layout only: the tree's size and place. It scrolls inside when its rows need more room. */
  className?: string;
};

/**
 * Nested items that open and close, such as folders and their files: React Aria's tree (one Tab
 * stop, entered at the selected row if there is one; Up and Down between visible rows; Right opens
 * a row; Left closes an open row, or moves to the parent of a closed one; Home and End; typing a
 * title's first letters moves to it), with token styling. Rows are `TreeItem`s. With
 * `selectionMode`, rows are selected by React Aria's rules: the default `selectionBehavior='toggle'`
 * gives each row a checkbox, and `'replace'` selects on press as a list does. `onAction` gives a row
 * an action of its own; a tree with neither selection nor actions opens and closes a row on Enter
 * or a press.
 */
export const Tree = <T extends object>({
  className,
  ...props
}: TreeProps<T>) => (
  <AriaTree
    {...props}
    className={(renderProps) => treeStyles({ ...renderProps, className })}
  />
);
