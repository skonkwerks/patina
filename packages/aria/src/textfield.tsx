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

import { focusRing } from './focus.ts';
import { useShownErrorFollowsValue } from './shownerror.ts';

export const textFieldStyles = tv({
  slots: {
    root: 'flex flex-col gap-1',
    labelRow: 'flex items-center gap-1',
    label: 'text-surface-foreground text-sm font-medium',
    description: 'text-surface-foreground-muted text-xs',
    error: 'text-destructive text-xs',
  },
});

/** The input itself, which carries the shared focus ring. */
export const textFieldInputStyles = tv({
  extend: focusRing,
  base: 'bg-input text-input-foreground border-input-border placeholder:text-input-placeholder h-8 rounded-md border px-3 text-sm',
  variants: {
    isInvalid: { true: 'border-destructive' },
    isDisabled: { true: 'cursor-not-allowed opacity-50' },
  },
});

export type TextFieldProps = Omit<AriaTextFieldProps, 'className'> & {
  /** The visible label; a field in a toolbar may carry `aria-label` instead. */
  label?: string;
  /** Optional help control beside the label, outside the label itself. */
  contextualHelp?: ReactNode;
  description?: string;
  /** The error to show under the field; also marks the field invalid. */
  errorMessage?: string;
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
  const styles = textFieldStyles();
  return (
    <AriaTextField
      ref={field}
      {...rest}
      // An explicit isInvalid makes React Aria skip `validate` and native constraints, so it is set
      // only for a caller's error.
      isInvalid={errorMessage === undefined ? rest.isInvalid : true}
      className={styles.root({ className })}
    >
      {label &&
        (contextualHelp ? (
          <div className={styles.labelRow()}>
            <Label className={styles.label()}>{label}</Label>
            {contextualHelp}
          </div>
        ) : (
          <Label className={styles.label()}>{label}</Label>
        ))}
      <Input
        placeholder={placeholder}
        className={(renderProps) => textFieldInputStyles(renderProps)}
      />
      {description && (
        <Text slot='description' className={styles.description()}>
          {description}
        </Text>
      )}
      <FieldError className={styles.error()}>{errorMessage}</FieldError>
    </AriaTextField>
  );
};
