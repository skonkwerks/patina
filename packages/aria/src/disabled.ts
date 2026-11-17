/**
 * The one disabled look, for every control and every disabled option of a list or a menu: half as
 * strong, with a cursor that says it cannot be used. It is applied to the control and to its label,
 * part by part, never to a container around them, so two fades never compound. A field's
 * description, its error, and a value shown beside it keep their contrast: they are not the label
 * of a disabled control, and a fade would make them unreadable. Each component gives it as the
 * `true` value of its `isDisabled` variant, read from React Aria's render state.
 */
export const DISABLED = 'cursor-not-allowed opacity-50';
