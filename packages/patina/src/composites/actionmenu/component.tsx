import { IconDotsVertical } from '@tabler/icons-react';
import { type ReactNode, useRef } from 'react';
import type { Key } from 'react-aria-components';

import { IconButton } from '../../aria/iconbutton/index.ts';
import { Menu, MenuTrigger } from '../../aria/menu/index.ts';
import { actionMenuStyles } from './styles.ts';

export type ActionMenuProps = {
  /** The name of the menu's control, which shows three dots and no text: "Actions for" and the row's name. */
  'aria-label': string;
  /** A write started from the menu is running: the spinner stands in place of the dots, and the menu does not open. */
  isPending?: boolean;
  isDisabled?: boolean;
  /**
   * Called with the id of the item that was chosen, and with the menu's control. The control is
   * what a surface opened by the choice returns the focus to when it closes, such as the side
   * panel: the chosen item is gone with the menu by then, and React Aria's menu hands its action
   * the item's id alone.
   */
  onAction: (key: Key, control: HTMLButtonElement | null) => void;
  /** The menu's items: `MenuItem`s, grouped by `MenuSeparator`s. */
  children: ReactNode;
};

/**
 * A menu of actions behind a "more" control: the vertical dots, last in the row, and the menu they open. Every
 * list's rows use this one, so the control, its name, and where the menu opens are the same in
 * all of them.
 */
export const ActionMenu = ({
  'aria-label': ariaLabel,
  isPending = false,
  isDisabled = false,
  onAction,
  children,
}: ActionMenuProps) => {
  const control = useRef<HTMLButtonElement>(null);
  return (
    <MenuTrigger>
      <IconButton
        ref={control}
        aria-label={ariaLabel}
        isPending={isPending}
        isDisabled={isDisabled}
      >
        <IconDotsVertical aria-hidden className={actionMenuStyles().icon()} />
      </IconButton>
      <Menu onAction={(key) => onAction(key, control.current)}>{children}</Menu>
    </MenuTrigger>
  );
};
