import { type RefObject, useEffect } from 'react';

/**
 * Keeps a field's shown error true to its value. React Aria shows the validation it last
 * committed. It commits on submit and on the input's native `change` event, which a browser fires
 * only when the person leaves a field they changed; a form reset clears the shown error instead.
 * So an error stood after a value set from code (an applied suggestion, an inserted subject, a
 * preset) and, in a text field, while the person typed the fix. While the field shows an error,
 * each change of its `value` prop commits again; a field showing no error is left alone, so none
 * appears before the person has done anything.
 *
 * A number field's `value` changes only when React Aria commits the typed text (on blur, Enter,
 * paste, or a step button), so there a typed fix still clears when it is committed; a value set
 * from code clears it at once.
 *
 * A date or time field (and a date picker) has no visible input: its form value lives in a hidden
 * input that carries no `aria-invalid`, beside a second hidden input for the browser's autofill
 * (`form=""`, so it is never submitted). There the field's root says it shows an error
 * (`data-invalid`), and the commit goes to the form input. React Aria commits a date field when the
 * focus leaves it changed, and a date picker also when a date is chosen in its calendar.
 *
 * This relies on how the installed React Aria implements commits, not on its documented API: the
 * native `change` listener of its private `useFormValidation`, and the date fields' two hidden
 * inputs. Check it again when upgrading React Aria: show an error, set the value from code, and see
 * the error clear (the `SetFromCode` stories of `DateField`, `TimeField`, `DatePicker` and
 * `DateRangePicker` do this for the date fields).
 */
export const useShownErrorFollowsValue = (
  field: RefObject<HTMLElement | null>,
  value: unknown,
) => {
  useEffect(() => {
    const root = field.current;
    if (root === null) {
      return;
    }
    const shownInput =
      root.querySelector(
        'input[aria-invalid="true"], textarea[aria-invalid="true"]',
      ) ??
      (root.matches('[data-invalid]')
        ? root.querySelector('input:not([form=""])')
        : null);
    shownInput?.dispatchEvent(new Event('change'));
  }, [field, value]);
};
