import { useId } from 'react';

/**
 * For a text that describes a field's control but that React Aria does not wire to it: the
 * description of a field React Aria gives no description slot (a slider) or that is not one React
 * Aria field (`ColorPicker`, `MultiSelect`), which `FieldHeader` draws with this id
 * (`descriptionId`); and the pending words of a `Select` or a `ComboBox`, which come and go after
 * the field mounts, when React Aria no longer looks for a description. It gives the text's id, and
 * the control's `aria-describedby`, which lists the caller's own `describedBy` and then that id
 * while there is a text.
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
