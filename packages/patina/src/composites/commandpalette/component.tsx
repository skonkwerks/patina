import {
  Autocomplete,
  Menu as AriaMenu,
  type MenuProps as AriaMenuProps,
  useFilter,
} from 'react-aria-components';

import { Dialog, DialogModal } from '../../aria/dialog/index.js';
import { menuStyles } from '../../aria/menu/index.js';
import { SearchField } from '../../aria/searchfield/index.js';
import { useOpenShortcut } from './shortcut.js';
import { commandPaletteStyles } from './styles.js';

export type CommandPaletteProps<T extends object> = Omit<
  AriaMenuProps<T>,
  | 'className'
  | 'style'
  | 'onClose'
  | 'renderEmptyState'
  | 'aria-label'
  | 'aria-labelledby'
> & {
  /** Whether the palette is open; it is opened from state, by its shortcut or by a control. */
  isOpen: boolean;
  /** Called with `true` when the shortcut opens it, and with `false` when it closes. */
  onOpenChange: (isOpen: boolean) => void;
  /** The dialog's title, which also names the list of commands, such as "Commands". */
  title: string;
  /** Accessible name of the icon-only close control in the title row, such as "Close". */
  closeLabel: string;
  /** Accessible name of the search field, such as "Search commands". */
  searchLabel: string;
  /** An example value for the search field, never a label or an instruction. */
  placeholder?: string;
  /** What the list says when the search matches no command, such as "No matching commands". */
  emptyText: string;
  /**
   * The key that opens the palette from anywhere on the page together with the platform's command
   * modifier (Command on Apple's systems, Control elsewhere), such as `k`. None by default: which
   * shortcut an application claims is its own choice.
   */
  shortcutKey?: string;
};

/**
 * A command palette: a search field over a list of commands in a modal, React Aria's `Autocomplete`
 * around a `Menu`. Typing filters the commands (by their text, ignoring case and accents), the
 * arrow keys move through what is left while the focus stays in the field, and Enter or a press runs
 * a command (its `onAction`, or the palette's) and closes the palette. Escape clears the search
 * first, as every search field does, and closes the palette once it is empty; the focus then
 * returns to where it was. The commands are `MenuItem`s, which may be grouped by `MenuSeparator`s;
 * a command that cannot apply now is left out of them, not disabled.
 */
export const CommandPalette = <T extends object>({
  isOpen,
  onOpenChange,
  title,
  closeLabel,
  searchLabel,
  placeholder,
  emptyText,
  shortcutKey,
  ...menu
}: CommandPaletteProps<T>) => {
  const { contains } = useFilter({ sensitivity: 'base' });
  useOpenShortcut(shortcutKey, () => onOpenChange(true));
  const styles = commandPaletteStyles();
  return (
    <DialogModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      className={styles.modal()}
    >
      <Dialog title={title} closeLabel={closeLabel}>
        {({ close }) => (
          <Autocomplete filter={contains}>
            <SearchField
              autoFocus
              aria-label={searchLabel}
              placeholder={placeholder}
            />
            <AriaMenu
              {...menu}
              aria-label={title}
              // A command runs and the palette closes, as a menu closes when one of its items runs.
              // Inside a `DialogTrigger` React Aria's menu would close the trigger's state itself;
              // a palette opened from state alone, by its shortcut, closes only through this.
              onClose={close}
              renderEmptyState={() => (
                <p className={styles.empty()}>{emptyText}</p>
              )}
              className={menuStyles().menu({ className: styles.menu() })}
            />
          </Autocomplete>
        )}
      </Dialog>
    </DialogModal>
  );
};
