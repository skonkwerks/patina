import { type ReactNode, type Ref, useRef } from 'react';
import {
  FieldError,
  Label,
  Text,
  TextArea as AriaTextArea,
  TextField as AriaTextField,
  type TextFieldProps as AriaTextFieldProps,
} from 'react-aria-components';
import { tv } from 'tailwind-variants';

import { fieldBoxStyles, fieldStyles } from './field.ts';
import { useShownErrorFollowsValue } from './shownerror.ts';

/** The label row of a text area, which may hold actions at its end beside the label. */
export const textAreaStyles = tv({
  slots: { header: 'flex items-center justify-between gap-2' },
});

/** The text area itself: the shared field box, several lines tall. */
export const textAreaInputStyles = tv({
  extend: fieldBoxStyles,
  base: 'placeholder:text-input-placeholder w-full px-3 py-2',
});

/** The props `TextArea` and `TextDropArea` share. */
export type TextAreaFieldProps = Omit<AriaTextFieldProps, 'className'> & {
  label: string;
  inputRef?: Ref<HTMLTextAreaElement>;
  /** Optional help control beside the label, outside the label itself. */
  contextualHelp?: ReactNode;
  labelActions?: ReactNode;
  description?: string;
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
 * The field `TextArea` and `TextDropArea` share, defined once: the label row, the input, the
 * description, and the error, in React Aria's text field anatomy. Each of the two places the input
 * in one element tree of its own.
 */
export const TextAreaBase = ({
  label,
  inputRef,
  contextualHelp,
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
  const header = textAreaStyles();
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
      {({ isDisabled }) => {
        const parts = fieldStyles({ isDisabled });
        return (
          <>
            <div className={header.header()}>
              <div className={parts.labelRow()}>
                <Label className={parts.label()}>{label}</Label>
                {contextualHelp}
              </div>
              {labelActions}
            </div>
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
            {description && (
              <Text slot='description' className={parts.description()}>
                {description}
              </Text>
            )}
            <FieldError className={parts.error()}>{errorMessage}</FieldError>
          </>
        );
      }}
    </AriaTextField>
  );
};
