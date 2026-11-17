import {
  Menu as AriaMenu,
  MenuTrigger,
  type PopoverProps,
} from 'react-aria-components';
import { tv } from 'tailwind-variants';

import { Popover } from '../popover/index.ts';
import type { SubmenuProps } from './submenu.tsx';

export { MenuTrigger };

export const menuStyles = tv({
  slots: {
    popover: 'min-w-40 p-1',
    menu: 'outline-0',
  },
});

/** How far a menu stands below its trigger, in pixels. */
const MENU_OFFSET_PX = 4;

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
