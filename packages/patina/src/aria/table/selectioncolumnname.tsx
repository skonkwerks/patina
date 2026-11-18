import { CheckboxContext, useSlottedContext } from 'react-aria-components';

/**
 * The selection column's name in a table that selects one row, where the header shows no
 * select-all: the localized name React Aria gives the header's selection checkbox then ("Select"),
 * for assistive technology only, so the column is not a nameless header.
 *
 * This reads React Aria's implementation, not its documented API: React Aria's table documentation
 * leaves that column empty, and the name comes from `useTableSelectAllCheckbox`, which React Aria's
 * header row passes to a checkbox in its `selection` slot through `CheckboxContext`. It is checked
 * on every React Aria upgrade; the story "Select One" fails if it changes.
 */
export const SelectionColumnName = () => {
  const name = useSlottedContext(CheckboxContext, 'selection')?.['aria-label'];
  return <span className='sr-only'>{name}</span>;
};
