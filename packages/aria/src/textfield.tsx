import { type ReactNode, useRef } from 'react';
import {
  FieldError,
  Input,
  Label,
  Text,
  TextField as AriaTextField,
  type TextFieldProps as AriaTextFieldProps,
} from 'react-aria-components';
import { tv } from 'tailwind-variants';

import { fieldBoxStyles, fieldStyles } from './field.ts';
import { useShownErrorFollowsValue } from './shownerror.ts';

/** The input itself: the shared field box, one line tall. */
export const textFieldInputStyles = tv({
  extend: fieldBoxStyles,
  base: 'placeholder:text-input-placeholder h-8 px-3',
});

export type TextFieldProps = Omit<AriaTextFieldProps, 'className'> & {
  /** The visible label; a field in a toolbar may carry `aria-label` instead. */
  label?: string;
  /** Optional help control beside the label, outside the label itself. */
  contextualHelp?: ReactNode;
  description?: string;
  /** The error to show under the field; also marks the field invalid. */
  errorMessage?: string;
  /** An example value, never a label or an instruction. */
  placeholder?: string;
  className?: string;
};

/** A labeled single-line text input with optional description and error. */
export const TextField = ({
  label,
  contextualHelp,
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
      {({ isDisabled }) => {
        const parts = fieldStyles({ isDisabled });
        return (
          <>
            {label && (
              <div className={parts.labelRow()}>
                <Label className={parts.label()}>{label}</Label>
                {contextualHelp}
              </div>
            )}
            <Input
              placeholder={placeholder}
              className={(renderProps) => textFieldInputStyles(renderProps)}
            />
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
