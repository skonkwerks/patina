import { use } from 'react';
import {
  Menu as AriaMenu,
  MenuTrigger,
  type PopoverProps,
  RootMenuTriggerStateContext,
} from 'react-aria-components';
import { tv } from 'tailwind-variants';

import { Popover } from '../popover/index.ts';
import type { SubmenuProps } from './submenu.tsx';

/*
 * `MenuTrigger` is React Aria's: it opens the `Menu` it holds. By default a press on the control
 * beside the menu opens it under the control. With `trigger='contextMenu'` it is a context menu: a
 * right click, Control and a click on a Mac, a long press on a touch screen, or the keyboard's
 * context menu command (Shift+F10, or Control+Enter on a Mac) opens it in place of the browser's
 * own menu, at the point React Aria gives it: where the pointer was for a click or a long press, on
 * the control for the keyboard. A press still does the control's own action. A context menu is a
 * shortcut: its actions also have a visible home, such as the item's `ActionMenu`.
 */
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
   * Defaults to `bottom end`: under the trigger, aligned to its end edge. A context menu takes no
   * placement: it opens at the point React Aria gives it.
   */
  placement?: PopoverProps['placement'];
};

/**
 * A dropdown menu in a popover under its trigger, or, as a context menu, at the point React Aria
 * gives it (see `MenuTrigger`). Items are `MenuItem`s; `MenuSeparator` groups them. An item that
 * opens a further menu is the first child of a `SubmenuTrigger`, and the menu it opens, a
 * `Submenu`, the second.
 */
export const Menu = <T extends object>({
  placement = 'bottom end',
  ...props
}: MenuProps<T>) => {
  // A context menu's trigger records where it opens in its state's documented `point` (React
  // Stately's `OverlayTriggerState`: the cursor position when the overlay was triggered); a menu
  // opened by a press has none. React Aria then anchors the popover at that point with its own
  // placement and no offset, so this menu gives neither: a prop left `undefined` keeps React Aria's
  // value. That is React Aria's implementation, not its documented API (`useContextProps` merges
  // with `mergeProps`, which keeps the earlier value for a prop that is `undefined`); the story
  // "Context Menu" fails if it changes.
  const opensAtPoint = use(RootMenuTriggerStateContext)?.point != null;
  const styles = menuStyles();
  return (
    <Popover
      placement={opensAtPoint ? undefined : placement}
      offset={opensAtPoint ? undefined : MENU_OFFSET_PX}
      className={styles.popover()}
    >
      <AriaMenu {...props} className={styles.menu()} />
    </Popover>
  );
};
