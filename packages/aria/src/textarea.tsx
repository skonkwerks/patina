import { type ReactNode, type Ref, useRef, useState } from 'react';
import {
  FieldError,
  isTextDropItem,
  Label,
  Text,
  TextArea as AriaTextArea,
  TextField as AriaTextField,
  type TextFieldProps as AriaTextFieldProps,
} from 'react-aria-components';
import { tv } from 'tailwind-variants';

import { DropTarget } from './droptarget.tsx';
import { focusRing } from './focus.ts';
import { useShownErrorFollowsValue } from './shownerror.ts';

export const textAreaStyles = tv({
  slots: {
    root: 'flex flex-col gap-1',
    header: 'flex items-center justify-between gap-2',
    labelRow: 'flex items-center gap-1',
    label: 'text-surface-foreground text-sm font-medium',
    description: 'text-surface-foreground-muted text-xs',
    error: 'text-destructive text-xs',
  },
});

/** The text area itself, which carries the shared focus ring. */
export const textAreaInputStyles = tv({
  extend: focusRing,
  base: 'bg-input text-input-foreground border-input-border placeholder:text-input-placeholder w-full rounded-md border px-3 py-2 text-sm',
  variants: {
    isInvalid: { true: 'border-destructive' },
    isDisabled: { true: 'cursor-not-allowed opacity-50' },
  },
});

export type TextAreaProps = Omit<AriaTextFieldProps, 'className'> & {
  label: string;
  inputRef?: Ref<HTMLTextAreaElement>;
  /** Opt-in typed text drops. The owner controls insertion and validation. */
  textDrop?: {
    type: string;
    onDrop: (text: string) => void;
    /** Shown when the dropped text cannot be read. */
    errorMessage: string;
    /** Shown when the drop holds more than one item or none of the accepted type; nothing is inserted. */
    refusedMessage: string;
  };
  /** Optional help control beside the label, outside the label itself. */
  contextualHelp?: ReactNode;
  labelActions?: ReactNode;
  description?: string;
  errorMessage?: string;
  placeholder?: string;
  rows?: number;
  className?: string;
};

/** A labeled multi-line text input with optional description and error. */
export const TextArea = ({
  label,
  inputRef,
  textDrop,
  contextualHelp,
  labelActions,
  description,
  errorMessage,
  placeholder,
  rows = 6,
  className,
  ...rest
}: TextAreaProps) => {
  const [dropError, setDropError] = useState<string | null>(null);
  const field = useRef<HTMLDivElement>(null);
  useShownErrorFollowsValue(field, rest.value);
  const styles = textAreaStyles();
  const input = (
    <AriaTextArea
      ref={inputRef}
      rows={rows}
      placeholder={placeholder}
      className={(renderProps) => textAreaInputStyles(renderProps)}
    />
  );
  return (
    <AriaTextField
      ref={field}
      {...rest}
      // An explicit isInvalid makes React Aria skip `validate` and native constraints, so it is set
      // only for a caller's error.
      isInvalid={errorMessage === undefined ? rest.isInvalid : true}
      className={styles.root({ className })}
    >
      <div className={styles.header()}>
        <div className={styles.labelRow()}>
          <Label className={styles.label()}>{label}</Label>
          {contextualHelp}
        </div>
        {labelActions}
      </div>
      {textDrop ? (
        <DropTarget
          aria-label={label}
          isDisabled={rest.isDisabled || rest.isReadOnly}
          getDropOperation={(types) =>
            types.has(textDrop.type) ? 'copy' : 'cancel'
          }
          onDrop={(event) => {
            setDropError(null);
            const item = event.items.length === 1 ? event.items[0] : undefined;
            if (
              !item ||
              !isTextDropItem(item) ||
              !item.types.has(textDrop.type)
            ) {
              setDropError(textDrop.refusedMessage);
              return;
            }
            void item
              .getText(textDrop.type)
              .then((text) => {
                if (!rest.isDisabled && !rest.isReadOnly) {
                  textDrop.onDrop(text);
                }
              })
              .catch(() => setDropError(textDrop.errorMessage));
          }}
        >
          {input}
        </DropTarget>
      ) : (
        input
      )}
      {dropError && (
        <p role='alert' className={styles.error()}>
          {dropError}
        </p>
      )}
      {description && (
        <Text slot='description' className={styles.description()}>
          {description}
        </Text>
      )}
      <FieldError className={styles.error()}>{errorMessage}</FieldError>
    </AriaTextField>
  );
};
