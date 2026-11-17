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

import { IconCheck, IconChevronRight } from './icons.tsx';
import { Popover } from './popover.tsx';

export const menuStyles = tv({
  slots: {
    popover: 'min-w-40 p-1',
    menu: 'outline-0',
  },
});

export const menuItemStyles = tv({
  slots: {
    root: 'text-overlay-foreground flex cursor-default items-center rounded px-2 py-1.5 text-sm outline-0 select-none',
    check: 'mr-2 h-4 w-4 shrink-0',
    // Held off a long label, at the item's end.
    submenuIndicator: 'ml-auto flex shrink-0 pl-3',
    submenuIcon: 'h-4 w-4',
  },
  variants: {
    isDestructive: { true: { root: 'text-destructive' } },
    isFocused: { true: { root: 'bg-overlay-hover' } },
    isDisabled: { true: { root: 'cursor-not-allowed opacity-50' } },
    isSelected: { false: { check: 'invisible' } },
  },
});

export const menuSeparatorStyles = tv({ base: 'bg-overlay-border my-1 h-px' });

export { MenuTrigger, SubmenuTrigger };

export type MenuProps<T extends object> = Omit<AriaMenuProps<T>, 'className'>;

export type DropdownMenuProps<T extends object> = MenuProps<T> & {
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
}: DropdownMenuProps<T>) => {
  const styles = menuStyles();
  return (
    <Popover placement={placement} offset={4} className={styles.popover()}>
      <AriaMenu {...props} className={styles.menu()} />
    </Popover>
  );
};

/**
 * The menu a `SubmenuTrigger` opens beside its item. React Aria places it at the item's end, so it
 * takes no placement; it overlaps the menu it opens from a little, its first item level with the
 * item that opened it.
 */
export const Submenu = <T extends object>(props: MenuProps<T>) => {
  const styles = menuStyles();
  return (
    <Popover offset={-2} crossOffset={-5} className={styles.popover()}>
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
      menuItemStyles({ isDestructive, isFocused, isDisabled }).root()
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
