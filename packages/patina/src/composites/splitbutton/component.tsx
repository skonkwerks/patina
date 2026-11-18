import { IconChevronDown } from '@tabler/icons-react';
import type { ReactElement, ReactNode } from 'react';

import { ButtonBase } from '../../aria/button/base.js';
import type { ButtonProps } from '../../aria/button/index.js';
import { MenuTrigger } from '../../aria/menu/index.js';
import {
  splitButtonMenuIconStyles,
  splitButtonPartStyles,
  splitButtonStyles,
} from './styles.js';

export type SplitButtonProps = Omit<
  ButtonProps,
  'variant' | 'tone' | 'radius' | 'className' | 'tooltip'
> & {
  /** The menu part's name: what its menu sets, such as "Run options". It says the shown value in words when `menuContent` shows one. */
  menuLabel: string;
  /** The menu the menu part opens: a `Menu` of `MenuItem`s. */
  menu: ReactElement;
  /**
   * What the menu part shows in place of the chevron, such as the value its menu sets ("3×").
   * Left out, the menu part is an icon button with a chevron.
   */
  menuContent?: ReactNode;
  /**
   * Wraps the action for an action a wrapper carries out on its press, such as a `FilePicker` that
   * opens the system's file dialog. The menu part stays outside the wrapper. The action is wrapped
   * for the split button's whole life, so it is never remounted and never drops its focus. A wrapper
   * carries out any press, one on a button disabled by its reason included, so the wrapper itself
   * must refuse the press while the action cannot be pressed: give `FilePicker` `isDisabled` while
   * the action has a `disabledReason` or `isDisabled`.
   */
  wrapAction?: (action: ReactElement) => ReactNode;
};

/**
 * The primary action of where it stands, with a menu beside it that sets how the action is carried
 * out, such as how many times. The two parts are joined for the eye alone: each is a button with its
 * own name and focus, so the wrapper has no role and no name. The button's props go to the action,
 * which is the part that says why it cannot be pressed (`disabledReason`) and that it is at work
 * (`isPending`). The menu part stays open to a change while the action only waits for something,
 * and is disabled with the action while it is at work; it is never disabled by itself.
 */
export const SplitButton = ({
  menu,
  menuLabel,
  menuContent,
  wrapAction,
  size,
  isPending = false,
  children,
  ...props
}: SplitButtonProps) => {
  const styles = splitButtonStyles();
  const look = { variant: 'solid', tone: 'primary', size } as const;
  const action = (
    <ButtonBase
      {...props}
      isPending={isPending}
      styles={(state) =>
        splitButtonPartStyles({ ...state, ...look, join: 'action' })
      }
      pendingIndicator='leading'
      spinnerSize={size === 'sm' ? 'sm' : 'md'}
    >
      {children}
    </ButtonBase>
  );
  return (
    <div className={styles.root()}>
      {wrapAction ? wrapAction(action) : action}
      <MenuTrigger>
        <ButtonBase
          aria-label={menuLabel}
          isDisabled={isPending}
          styles={(state) =>
            menuContent === undefined
              ? splitButtonMenuIconStyles({ ...state, ...look, join: 'menu' })
              : splitButtonPartStyles({ ...state, ...look, join: 'menu' })
          }
          pendingIndicator='replace'
          spinnerSize={size === 'sm' ? 'sm' : 'md'}
        >
          {menuContent ?? (
            <IconChevronDown aria-hidden className={styles.chevron()} />
          )}
        </ButtonBase>
        {menu}
      </MenuTrigger>
    </div>
  );
};
