import type { ReactNode } from 'react';
import {
  Label,
  TagGroup as AriaTagGroup,
  type TagGroupProps as AriaTagGroupProps,
  TagList,
  type TagListProps,
  Text,
} from 'react-aria-components';
import { tv } from 'tailwind-variants';

import { fieldStyles } from '../../internal/field.ts';
import { focusRing } from '../../internal/focus.ts';

/**
 * The row of tags, wrapping onto further lines. It carries the shared focus ring for when it holds
 * the focus itself, which it does while it is empty; otherwise the focus is on a tag. The ring
 * stands a little further out than a control's, so it clears the line that says the group is empty.
 */
export const tagListStyles = tv({
  extend: focusRing,
  // No slots here: with slots, tailwind-variants puts the focus ring's `outline-offset-2` after this
  // base, and the wider offset would be dropped.
  base: 'flex min-h-6 flex-wrap items-center gap-1.5 rounded-md outline-offset-4',
});

/** What the group says while it has no tags. */
export const tagListEmptyStyles = tv({
  base: 'text-surface-foreground-muted text-xs',
});

export type TagGroupProps<T extends object> = Omit<
  AriaTagGroupProps,
  'className' | 'children'
> &
  Pick<TagListProps<T>, 'items' | 'dependencies'> & {
    /** The visible label, such as "Labels", which names the group; a group without one carries `aria-label`. */
    label?: string;
    description?: string;
    /** An error to show under the tags, such as "Remove a label to add another". */
    errorMessage?: string;
    /** What the group says while it has no tags, such as "No labels yet". */
    emptyLabel?: string;
    /** The tags: `Tag`s, or a function that renders one for each of `items`. */
    children: ReactNode | ((item: T) => ReactNode);
    /** Layout only. */
    className?: string;
  };

/**
 * A labeled group of tags: labels a person can remove, select to filter by, or press. One Tab stop,
 * with the arrow keys between the tags. Give `onRemove` to make the tags removable (with their
 * remove control, Delete, or Backspace), and a `selectionMode` to make them selectable. A label that
 * only states something, with nothing to do, is a `Chip`.
 */
export const TagGroup = <T extends object>({
  label,
  description,
  errorMessage,
  emptyLabel,
  items,
  dependencies,
  children,
  className,
  ...rest
}: TagGroupProps<T>) => {
  const parts = fieldStyles();
  return (
    <AriaTagGroup {...rest} className={parts.root({ className })}>
      {label && <Label className={parts.label()}>{label}</Label>}
      <TagList
        items={items}
        dependencies={dependencies}
        className={({ isFocusVisible }) => tagListStyles({ isFocusVisible })}
        renderEmptyState={
          emptyLabel === undefined
            ? undefined
            : () => <span className={tagListEmptyStyles()}>{emptyLabel}</span>
        }
      >
        {children}
      </TagList>
      {description && (
        <Text slot='description' className={parts.description()}>
          {description}
        </Text>
      )}
      {errorMessage && (
        <Text slot='errorMessage' className={parts.error()}>
          {errorMessage}
        </Text>
      )}
    </AriaTagGroup>
  );
};
