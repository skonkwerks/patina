import { useId } from 'react';

/**
 * For a field that wires its description to its control itself, because React Aria gives it no
 * description slot (a slider) or it is not one React Aria field (`ColorPicker`, `MultiSelect`):
 * the id `FieldHeader` gives the description (`descriptionId`), and the control's
 * `aria-describedby`, which lists that id while there is a description, after the caller's own
 * `describedBy`.
 */
export const useDescriptionId = (
  description: string | undefined,
  describedBy?: string,
) => {
  const descriptionId = useId();
  const ids = [
    describedBy,
    description === undefined || description === '' ? undefined : descriptionId,
  ].filter((id) => id !== undefined && id !== '');
  return {
    descriptionId,
    'aria-describedby': ids.length === 0 ? undefined : ids.join(' '),
  };
};
