import { TextAreaBase, type TextAreaFieldProps } from './base.tsx';

export { textAreaInputStyles, textAreaStyles } from './base.tsx';

export type TextAreaProps = TextAreaFieldProps;

/**
 * A labeled multi-line text input with optional description and error. A text area that takes
 * dropped text is a `TextDropArea`; this one carries no drop target.
 */
export const TextArea = (props: TextAreaProps) => (
  <TextAreaBase {...props} renderInput={(input) => input} />
);
