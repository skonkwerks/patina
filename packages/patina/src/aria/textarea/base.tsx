import { type ReactNode, type Ref, useRef } from 'react';
import {
  FieldError,
  TextArea as AriaTextArea,
  TextField as AriaTextField,
  type TextFieldProps as AriaTextFieldProps,
} from 'react-aria-components';
import { tv } from 'tailwind-variants';

import { fieldBoxStyles, fieldStyles } from '../../internal/field.ts';
import {
  FieldHeader,
  type FieldHeaderProps,
} from '../../internal/fieldheader.tsx';
import { useShownErrorFollowsValue } from '../../internal/shownerror.ts';

/** The text area itself: the shared field box, several lines tall. */
export const textAreaInputStyles = tv({
  extend: fieldBoxStyles,
  base: 'placeholder:text-input-placeholder w-full px-3 py-2',
});

/** The props `TextArea` and `TextDropArea` share. */
export type TextAreaFieldProps = Omit<AriaTextFieldProps, 'className'> &
  FieldHeaderProps & {
    label: string;
    inputRef?: Ref<HTMLTextAreaElement>;
    /** Actions at the end of the label row, such as a link that fills in a template. */
    labelActions?: ReactNode;
    errorMessage?: string;
    /** An example value, never a label or an instruction. */
    placeholder?: string;
    rows?: number;
    className?: string;
  };

export type TextAreaBaseProps = TextAreaFieldProps & {
  /**
   * Places the input: `TextArea` gives it as it is, `TextDropArea` inside its drop target. Given
   * whether the field can be edited now (neither disabled nor read-only).
   */
  renderInput: (input: ReactNode, canEdit: boolean) => ReactNode;
  /** A message under the input that is not the field's own error, such as a refused drop. */
  inputMessage?: ReactNode;
};

/**
 * The field `TextArea` and `TextDropArea` share, defined once, in React Aria's text field anatomy:
 * the shared field header (with `labelActions` at the end of its label row), the input, and the
 * error under it. Each of the two places the input in one element tree of its own.
 */
export const TextAreaBase = ({
  label,
  optionalText,
  info,
  inputRef,
  labelActions,
  description,
  errorMessage,
  placeholder,
  rows = 6,
  className,
  renderInput,
  inputMessage,
  ...rest
}: TextAreaBaseProps) => {
  const field = useRef<HTMLDivElement>(null);
  useShownErrorFollowsValue(field, rest.value);
  const canEdit = rest.isDisabled !== true && rest.isReadOnly !== true;
  return (
    <AriaTextField
      ref={field}
      {...rest}
      // An explicit isInvalid makes React Aria skip `validate` and native constraints, so it is set
      // only for a caller's error.
      isInvalid={errorMessage === undefined ? rest.isInvalid : true}
      className={fieldStyles().root({ className })}
    >
      {({ isDisabled }) => (
        <>
          <FieldHeader
            label={label}
            optionalText={optionalText}
            info={info}
            end={labelActions}
            description={description}
            isDisabled={isDisabled}
          />
          {renderInput(
            <AriaTextArea
              ref={inputRef}
              rows={rows}
              placeholder={placeholder}
              className={(renderProps) => textAreaInputStyles(renderProps)}
            />,
            canEdit,
          )}
          {inputMessage}
          <FieldError className={fieldStyles().error()}>
            {errorMessage}
          </FieldError>
        </>
      )}
    </AriaTextField>
  );
};
