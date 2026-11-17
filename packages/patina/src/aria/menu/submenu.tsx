import {
  Menu as AriaMenu,
  type MenuProps as AriaMenuProps,
  SubmenuTrigger,
} from 'react-aria-components';

import { Popover } from '../popover/index.ts';
import { menuStyles } from './component.tsx';

export { SubmenuTrigger };

/** How far a submenu overlaps the menu it opens from, so its first item is level with its opener. */
const SUBMENU_OFFSET_PX = -2;

const SUBMENU_CROSS_OFFSET_PX = -5;

/** A `Submenu`'s props: React Aria's menu props; React Aria places it beside its item. */
export type SubmenuProps<T extends object> = Omit<
  AriaMenuProps<T>,
  'className'
>;

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
