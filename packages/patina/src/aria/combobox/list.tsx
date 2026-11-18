import { type ReactNode, use } from 'react';
import { ComboBoxStateContext, ListBox } from 'react-aria-components';

import { listBoxEmptyStyles } from '../listbox/index.js';

type Props<T extends object> = {
  className: string;
  noMatchesLabel: string;
  /** Given while the options are read. */
  pendingText: string | undefined;
  children: ReactNode | ((item: T) => ReactNode);
};

/**
 * The combo box's list, and what it says while it has no options. While the options are read it
 * says `pendingText`; once text is typed, that nothing matches it. With no text typed and nothing
 * being read (a list a caller fills from a search that has not run), nothing true can be said, so
 * the list has no empty line at all: React Aria opens a list given `items` even while it is empty,
 * and "No regions match" there would speak of a search nobody made. The typed text is read from
 * React Aria's state, which only a component inside the combo box can reach.
 */
const C = <T extends object>({
  className,
  noMatchesLabel,
  pendingText,
  children,
}: Props<T>) => {
  const hasTypedText = (use(ComboBoxStateContext)?.inputValue ?? '') !== '';
  let emptyText: string | undefined;
  if (pendingText !== undefined) {
    emptyText = pendingText;
  } else if (hasTypedText) {
    emptyText = noMatchesLabel;
  }
  return (
    <ListBox
      className={className}
      renderEmptyState={
        emptyText === undefined
          ? undefined
          : () => <p className={listBoxEmptyStyles()}>{emptyText}</p>
      }
    >
      {children}
    </ListBox>
  );
};

C.displayName = 'ComboBoxList';
export default C;
