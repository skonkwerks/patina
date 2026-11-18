import { IconCheck } from '@tabler/icons-react';
import { type ReactNode, use } from 'react';
import {
  ListBoxItem as AriaListBoxItem,
  type ListBoxItemProps as AriaListBoxItemProps,
} from 'react-aria-components';
import { tv } from 'tailwind-variants';

import { checkMarkStyles } from '../../internal/checkmark.js';
import { overlayOptionStyles } from '../popover/index.js';
import { ListBoxLayerContext } from './layer.js';

/**
 * An option of a list: the shared overlay option (its `base` slot with the keyboard's focus ring, and
 * its single-choice check), the chosen one in a heavier weight. A long label wraps rather than
 * being cut, so two options that begin alike can be told apart; the mark before it stands at its
 * first line. On the surface layer (a standalone `ListBox`) it takes the surface's colors, and
 * lights up under the pointer, since there the focus does not follow it.
 */
export const listBoxItemStyles = tv({
  extend: overlayOptionStyles,
  slots: {
    label: 'min-w-0 flex-1 break-words',
    // The marks are 16px beside a 20px line: 2px down centers them on the first line.
    checkFrame: 'mt-0.5',
    mark: 'mt-0.5',
  },
  variants: {
    layer: { overlay: '', surface: 'text-surface-foreground' },
    isSelected: { true: 'font-medium' },
    isHovered: { true: '' },
  },
  // The overlay option's base centers its row and draws its focused fill in a variant; these
  // overrides come after both, as compound variants (styling-anti-patterns.md: an extending style's
  // override). The first holds for every layer.
  compoundVariants: [
    { layer: ['overlay', 'surface'], class: 'items-start' },
    { layer: 'surface', isFocused: true, class: 'bg-surface-hover' },
    { layer: 'surface', isHovered: true, class: 'bg-surface-hover' },
  ],
  defaultVariants: { layer: 'overlay' },
});

export type ListBoxItemProps = Omit<
  AriaListBoxItemProps,
  'className' | 'children'
> & {
  children: ReactNode;
};

/**
 * One option of a `ListBox`, a `Select`, a `ComboBox` or a `MultiSelect`. Where a press toggles an
 * option (multiple selection with React Aria's default `toggle` behavior), every option shows a
 * checkbox, the mark `Checkbox` draws at a list row's size, so the list reads as a multiple choice
 * before anything is chosen. Where a press replaces the choice (single selection, or the `replace`
 * behavior), the chosen option carries the shared check, as a `MenuItem` does, and every option
 * keeps its room, so the labels stay aligned. Pass `textValue` when the children are not plain
 * text, for typeahead, filtering, the option's name, and what a `Select`'s trigger shows.
 */
export const ListBoxItem = ({ children, ...rest }: ListBoxItemProps) => {
  const layer = use(ListBoxLayerContext);
  return (
    <AriaListBoxItem
      {...rest}
      textValue={
        rest.textValue ?? (typeof children === 'string' ? children : undefined)
      }
      className={({
        isFocused,
        isFocusVisible,
        isHovered,
        isSelected,
        isDisabled,
      }) =>
        listBoxItemStyles({
          layer,
          isFocused,
          isFocusVisible,
          isHovered,
          isSelected,
          isDisabled,
        }).base()
      }
    >
      {({ isSelected, selectionMode, selectionBehavior }) => {
        const styles = listBoxItemStyles({ layer, isSelected });
        const isCheckbox =
          selectionMode === 'multiple' && selectionBehavior === 'toggle';
        const box = checkMarkStyles({ size: 'sm', isSelected });
        return (
          <>
            {isCheckbox && (
              <span className={box.box({ className: styles.mark() })}>
                <IconCheck
                  aria-hidden
                  className={box.check()}
                  strokeWidth={2.5}
                />
              </span>
            )}
            {selectionMode !== 'none' && !isCheckbox && (
              <span className={styles.checkFrame()}>
                <IconCheck aria-hidden className={styles.check()} />
              </span>
            )}
            <span className={styles.label()}>{children}</span>
          </>
        );
      }}
    </AriaListBoxItem>
  );
};
