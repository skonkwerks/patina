import { IconCheck, IconChevronRight } from '@tabler/icons-react';
import type { ReactNode } from 'react';
import {
  Menu as AriaMenu,
  MenuItem as AriaMenuItem,
  type MenuItemProps as AriaMenuItemProps,
  type MenuProps as AriaMenuProps,
  MenuTrigger,
  type PopoverProps,
  Separator,
  SubmenuTrigger,
} from 'react-aria-components';
import { tv } from 'tailwind-variants';

import { overlayOptionStyles, Popover } from './popover.tsx';

export const menuStyles = tv({
  slots: {
    popover: 'min-w-40 p-1',
    menu: 'outline-0',
  },
});

/**
 * A menu item: the shared overlay option (its `base` slot), destructive items in the destructive
 * color, with the check of a selectable item and a submenu's indicator.
 */
export const menuItemStyles = tv({
  extend: overlayOptionStyles,
  slots: {
    check: 'h-4 w-4 shrink-0',
    // Held off a long label, at the item's end.
    submenuIndicator: 'ml-auto flex shrink-0 pl-3',
    submenuIcon: 'h-4 w-4',
  },
  variants: {
    // A string applies to the item itself, the `base` slot the overlay option defines.
    isDestructive: { true: 'text-destructive' },
    isSelected: { false: { check: 'invisible' } },
  },
});

export const menuSeparatorStyles = tv({ base: 'bg-overlay-border my-1 h-px' });

export { MenuTrigger, SubmenuTrigger };

/** How far a menu stands below its trigger, in pixels. */
const MENU_OFFSET_PX = 4;
/** How far a submenu overlaps the menu it opens from, so its first item is level with its opener. */
const SUBMENU_OFFSET_PX = -2;
const SUBMENU_CROSS_OFFSET_PX = -5;

/** A `Submenu`'s props: React Aria's menu props; React Aria places it beside its item. */
export type SubmenuProps<T extends object> = Omit<
  AriaMenuProps<T>,
  'className'
>;

export type MenuProps<T extends object> = SubmenuProps<T> & {
  /**
   * Where the menu opens relative to its trigger. React Aria flips it when there is no room.
   * Defaults to `bottom end`: under the trigger, aligned to its end edge.
   */
  placement?: PopoverProps['placement'];
};

/**
 * A dropdown menu in a popover under its trigger. Items are `MenuItem`s; `MenuSeparator` groups
 * them. An item that opens a further menu is the first child of a `SubmenuTrigger`, and the menu it
 * opens, a `Submenu`, the second.
 */
export const Menu = <T extends object>({
  placement = 'bottom end',
  ...props
}: MenuProps<T>) => {
  const styles = menuStyles();
  return (
    <Popover
      placement={placement}
      offset={MENU_OFFSET_PX}
      className={styles.popover()}
    >
      <AriaMenu {...props} className={styles.menu()} />
    </Popover>
  );
};

/**
 * The menu a `SubmenuTrigger` opens beside its item. React Aria places it at the item's end, so it
 * takes no placement; it overlaps the menu it opens from a little, its first item level with the
 * item that opened it.
 */
export const Submenu = <T extends object>(props: SubmenuProps<T>) => {
  const styles = menuStyles();
  return (
    <Popover
      offset={SUBMENU_OFFSET_PX}
      crossOffset={SUBMENU_CROSS_OFFSET_PX}
      className={styles.popover()}
    >
      <AriaMenu {...props} className={styles.menu()} />
    </Popover>
  );
};

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
    className={({ isFocused, isDisabled }) =>
      menuItemStyles({ isDestructive, isFocused, isDisabled }).base()
    }
  >
    {({ isSelected, selectionMode, hasSubmenu }) => {
      const styles = menuItemStyles({ isSelected });
      return (
        <>
          {selectionMode !== 'none' && (
            <IconCheck aria-hidden className={styles.check()} />
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

export const MenuSeparator = () => (
  <Separator className={menuSeparatorStyles()} />
);
