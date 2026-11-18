import { IconX } from '@tabler/icons-react';
import type { ReactNode } from 'react';
import {
  Button as AriaButton,
  Tag as AriaTag,
  type TagProps as AriaTagProps,
} from 'react-aria-components';
import { tv } from 'tailwind-variants';

import { chipStyles } from '../../chip/index.ts';
import { DISABLED } from '../../internal/disabled.ts';
import { focusRing } from '../../internal/focus.ts';

/**
 * A tag: the chip's rounded label (`chipStyles`, its neutral tone), made interactive. It adds the
 * height of a row of tags, the shared focus ring, a fill under the pointer where pressing it does
 * something, the primary fill while it is selected, and room at its end for the remove control.
 * The chip's tone is a variant of its own, so the tag's fills override it as compound variants
 * (styling-anti-patterns.md: an extending style's override).
 */
export const tagStyles = tv({
  extend: chipStyles,
  base: [
    focusRing.base,
    'h-6 max-w-full cursor-default gap-1 transition-colors select-none',
  ],
  slots: {
    label: 'min-w-0 truncate',
    removeIcon: 'h-3 w-3',
  },
  variants: {
    isFocusVisible: focusRing.variants.isFocusVisible,
    allowsRemoving: { true: 'pr-1' },
    isSelected: { true: '' },
    isHovered: { true: '' },
    isDisabled: { true: DISABLED },
  },
  compoundVariants: [
    { isSelected: false, isHovered: true, class: 'bg-surface-hover' },
    {
      isSelected: true,
      class: 'bg-primary text-primary-foreground border-primary',
    },
  ],
});

/** The remove control at a tag's end: a round control in the tag's own text color. */
export const tagRemoveStyles = tv({
  extend: focusRing,
  base: 'flex h-4 w-4 shrink-0 cursor-pointer items-center justify-center rounded-full hover:bg-current/15',
});

export type TagProps = Omit<AriaTagProps, 'className' | 'children'> & {
  children: ReactNode;
};

/**
 * One tag of a `TagGroup`: a label a person can remove, select, or press. Its remove control shows
 * while the group takes `onRemove`; React Aria names it ("Remove" and the tag's text), and Tab
 * reaches the focused tag's remove control before it leaves the group. Delete and Backspace also
 * remove the focused tag. Pass `textValue` when the children are not plain text.
 */
export const Tag = ({ children, ...rest }: TagProps) => (
  <AriaTag
    {...rest}
    textValue={
      rest.textValue ?? (typeof children === 'string' ? children : undefined)
    }
    className={({
      allowsRemoving,
      isSelected,
      isHovered,
      isDisabled,
      isFocusVisible,
    }) =>
      tagStyles({
        allowsRemoving,
        isSelected,
        isHovered,
        isDisabled,
        isFocusVisible,
      }).base()
    }
  >
    {({ allowsRemoving }) => {
      const styles = tagStyles();
      return (
        <>
          <span className={styles.label()}>{children}</span>
          {allowsRemoving && (
            <AriaButton
              slot='remove'
              className={(renderProps) => tagRemoveStyles(renderProps)}
            >
              <IconX aria-hidden className={styles.removeIcon()} />
            </AriaButton>
          )}
        </>
      );
    }}
  </AriaTag>
);
