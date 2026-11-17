import { ListBoxItem, type ListBoxItemProps } from 'react-aria-components';
import { tv } from 'tailwind-variants';

import { overlayOptionStyles } from '../popover/index.ts';

/** An option of the list: the shared overlay option, the chosen one in a heavier weight. */
export const selectItemStyles = tv({
  extend: overlayOptionStyles,
  variants: {
    isSelected: { true: 'font-medium' },
  },
});

export type SelectItemProps = Omit<ListBoxItemProps, 'className'>;

export const SelectItem = (props: SelectItemProps) => (
  <ListBoxItem
    {...props}
    className={({ isFocused, isSelected, isDisabled }) =>
      selectItemStyles({ isFocused, isSelected, isDisabled })
    }
  />
);
