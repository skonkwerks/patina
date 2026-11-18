import { type RefObject, use } from 'react';
import { ComboBoxStateContext } from 'react-aria-components';

import { useShownErrorFollowsValue } from '../../internal/shownerror.ts';

/**
 * Keeps the combo box's shown error true to what it judges, chosen from the list, typed, or set by
 * the application, controlled or not. React Aria commits a combo box's validation only when the
 * field is left, so without this, "Choose a region" would stand under a region just chosen with
 * Enter while the input keeps the focus. Its validation reads the chosen value and the typed text
 * (with `allowsCustomValue` the typed text is the value), so it follows each, in a call of its own:
 * each is React Aria's own state, whose identity changes only when it does. They are read from
 * React Aria's state, which only a component inside the combo box can reach.
 */
const C = ({ field }: { field: RefObject<HTMLDivElement | null> }) => {
  const state = use(ComboBoxStateContext);
  useShownErrorFollowsValue(field, state?.value);
  useShownErrorFollowsValue(field, state?.inputValue);
  return null;
};

C.displayName = 'ComboBoxShownError';
export default C;
