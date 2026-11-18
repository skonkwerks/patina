import { Checkbox } from 'react-aria-components';

import { CheckMark } from './checkmark.js';
import { focusRing } from './focus.js';
import { selectionCheckboxStyles } from './markstyles.js';
import { RadioMark } from './radiomark.js';

type SelectionCheckboxProps = {
  /**
   * `check` for a collection that selects several items: the shared check mark, with a dash while a
   * select-all's items are only partly selected. `radio` for one that selects one item: the shared
   * radio mark, since one choice among several reads as a radio.
   */
  mark: 'check' | 'radio';
  /**
   * For a checkbox outside any row (a table's select-all): it draws the disabled look itself when
   * React Aria disables it. A row's checkbox leaves it to its row, which fades as a whole, so two
   * fades never compound.
   */
  fadesWhenDisabled?: boolean;
  /** For a checkbox on the `neutral` fill (a table's select-all, in its header): its edge takes that fill's foreground. */
  isOnNeutral?: boolean;
  /** The caller's layout. */
  className?: string;
};

/**
 * The selection checkbox of a collection's row, or of a table's header: React Aria's checkbox in its
 * `selection` slot, which React Aria names ("Select" with the row's name, or "Select All") and ties
 * to its row or its collection, drawn at a row's size beside 14px text. The focus moves into it
 * from its row or cell, so it draws the focus ring. Defined once for `Tree` and `Table`.
 */
export const SelectionCheckbox = ({
  mark,
  fadesWhenDisabled = false,
  isOnNeutral = false,
  className,
}: SelectionCheckboxProps) => (
  <Checkbox
    slot='selection'
    className={({ isDisabled }) =>
      selectionCheckboxStyles({
        isDisabled: fadesWhenDisabled && isDisabled,
        className,
      })
    }
  >
    {({ isSelected, isIndeterminate, isFocusVisible }) => {
      const ring = focusRing({ isFocusVisible });
      return mark === 'radio' ? (
        <RadioMark size='sm' isSelected={isSelected} className={ring} />
      ) : (
        <CheckMark
          size='sm'
          isSelected={isSelected}
          isIndeterminate={isIndeterminate}
          isOnNeutral={isOnNeutral}
          className={ring}
        />
      );
    }}
  </Checkbox>
);
