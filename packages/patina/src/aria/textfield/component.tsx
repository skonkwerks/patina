import { useRef } from 'react';
import {
  FieldError,
  Input,
  TextField as AriaTextField,
  type TextFieldProps as AriaTextFieldProps,
} from 'react-aria-components';
import { tv } from 'tailwind-variants';

import { fieldBoxStyles, fieldStyles } from '../../internal/field.js';
import {
  FieldHeader,
  type FieldHeaderProps,
} from '../../internal/fieldheader.js';
import { useShownErrorFollowsValue } from '../../internal/shownerror.js';

/** The input itself: the shared field box, one line tall. */
export const textFieldInputStyles = tv({
  extend: fieldBoxStyles,
  base: 'placeholder:text-input-placeholder h-8 px-3',
});

export type TextFieldProps = Omit<AriaTextFieldProps, 'className'> &
  FieldHeaderProps & {
    /** The visible label; a field in a toolbar may carry `aria-label` instead. */
    label?: string;
    /** The error to show under the field; also marks the field invalid. */
    errorMessage?: string;
    /** An example value, never a label or an instruction. */
    placeholder?: string;
    className?: string;
  };

/** A labeled single-line text input, under the shared field header, with its error under it. */
export const TextField = ({
  label,
  optionalText,
  info,
  description,
  errorMessage,
  placeholder,
  className,
  ...rest
}: TextFieldProps) => {
  const field = useRef<HTMLDivElement>(null);
  useShownErrorFollowsValue(field, rest.value);
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
            description={description}
            isDisabled={isDisabled}
          />
          <Input
            placeholder={placeholder}
            className={(renderProps) => textFieldInputStyles(renderProps)}
          />
          <FieldError className={fieldStyles().error()}>
            {errorMessage}
          </FieldError>
        </>
      )}
    </AriaTextField>
  );
};
