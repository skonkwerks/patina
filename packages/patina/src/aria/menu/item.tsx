import { IconCheck, IconChevronRight } from '@tabler/icons-react';
import type { ReactNode } from 'react';
import {
  MenuItem as AriaMenuItem,
  type MenuItemProps as AriaMenuItemProps,
} from 'react-aria-components';
import { tv } from 'tailwind-variants';

import { overlayOptionStyles } from '../popover/index.js';

/**
 * A menu item: the shared overlay option (its `base` slot with the keyboard's focus ring, and its
 * check for a selectable item), destructive items in the destructive color, and a submenu's
 * indicator.
 */
export const menuItemStyles = tv({
  extend: overlayOptionStyles,
  slots: {
    // Held off a long label, at the item's end.
    submenuIndicator: 'ml-auto flex shrink-0 pl-3',
    submenuIcon: 'h-4 w-4',
  },
  variants: {
    // A string applies to the item itself, the `base` slot the overlay option defines.
    isDestructive: { true: 'text-destructive' },
  },
});

export type MenuItemProps = Omit<
  AriaMenuItemProps,
  'className' | 'children'
> & {
  children: ReactNode;
  /** The item destroys something: red text, as the destructive button is. */
  isDestructive?: boolean;
};

/**
 * One item of a `Menu`. In a menu with a selection mode, the selected item carries a check mark
 * and every item keeps the mark's room, so the labels stay aligned. An item that opens a `Submenu`
 * ends with a chevron that points to where it opens.
 */
export const MenuItem = ({
  isDestructive = false,
  children,
  ...rest
}: MenuItemProps) => (
  <AriaMenuItem
    {...rest}
    textValue={
      rest.textValue ?? (typeof children === 'string' ? children : undefined)
    }
    className={({ isFocused, isFocusVisible, isDisabled }) =>
      menuItemStyles({
        isDestructive,
        isFocused,
        isFocusVisible,
        isDisabled,
      }).base()
    }
  >
    {({ isSelected, selectionMode, hasSubmenu }) => {
      const styles = menuItemStyles({ isSelected });
      return (
        <>
          {selectionMode !== 'none' && (
            <span className={styles.checkFrame()}>
              <IconCheck aria-hidden className={styles.check()} />
            </span>
          )}
          {children}
          {hasSubmenu && (
            <span className={styles.submenuIndicator()}>
              <IconChevronRight aria-hidden className={styles.submenuIcon()} />
            </span>
          )}
        </>
      );
    }}
  </AriaMenuItem>
);
