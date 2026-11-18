import { IconCheck } from '@tabler/icons-react';
import {
  CheckboxButton,
  CheckboxField,
  type CheckboxFieldProps,
  FieldError,
  Text,
} from 'react-aria-components';
import { tv } from 'tailwind-variants';

import { checkMarkStyles } from '../../internal/checkmark.ts';
import { cn } from '../../internal/cn.ts';
import { choiceControlStyles } from '../../internal/field.ts';
import { focusRing } from '../../internal/focus.ts';

/**
 * A checkbox: the shared choice control, whose mark is the shared checkbox mark (`checkMarkStyles`):
 * a square with a control's edge that fills and shows a check when on.
 */
export const checkboxStyles = tv({ extend: choiceControlStyles });

export type CheckboxProps = Omit<
  CheckboxFieldProps,
  'className' | 'children'
> & {
  children: string;
  description?: string;
  /** Shown under the checkbox when it is invalid, such as a required acknowledgement left unchecked. */
  errorMessage?: string;
  className?: string;
};

/**
 * A labeled yes or no that is a value of a form: it takes effect when the form is submitted.
 * Something that takes effect the moment it is pressed is a `Switch`. It is React Aria's anatomy:
 * a field, the button that is its label, and its description as the field's own slot.
 */
export const Checkbox = ({
  children,
  description,
  errorMessage,
  className,
  ...rest
}: CheckboxProps) => (
  <CheckboxField
    {...rest}
    // An explicit isInvalid makes React Aria skip `validate` and `isRequired`, so it is set only
    // for a caller's error.
    isInvalid={errorMessage === undefined ? rest.isInvalid : true}
    className={checkboxStyles().root({ className })}
  >
    {({ isDisabled }) => {
      const styles = checkboxStyles({ isDisabled });
      return (
        <>
          <CheckboxButton className={styles.button()}>
            {({ isFocusVisible, isSelected }) => {
              const mark = checkMarkStyles({ isSelected });
              return (
                <>
                  <span
                    className={styles.mark({
                      className: cn(mark.box(), focusRing({ isFocusVisible })),
                    })}
                  >
                    <IconCheck
                      aria-hidden
                      className={mark.check()}
                      strokeWidth={2.5}
                    />
                  </span>
                  <span className={styles.label()}>{children}</span>
                </>
              );
            }}
          </CheckboxButton>
          {description && (
            <Text slot='description' className={styles.description()}>
              {description}
            </Text>
          )}
          <FieldError className={styles.error()}>{errorMessage}</FieldError>
        </>
      );
    }}
  </CheckboxField>
);
