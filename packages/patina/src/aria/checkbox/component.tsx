import {
  CheckboxButton,
  CheckboxField,
  type CheckboxFieldProps,
  FieldError,
  Text,
} from 'react-aria-components';
import { tv } from 'tailwind-variants';

import { CheckMark } from '../../internal/checkmark.js';
import { choiceControlStyles } from '../../internal/field.js';
import { focusRing } from '../../internal/focus.js';

/**
 * A checkbox: the shared choice control, whose mark is the shared checkbox mark (`checkMarkStyles`):
 * a square with a control's edge that fills and shows a check when on, or a dash when
 * indeterminate (`isIndeterminate`, such as a select-all over a partly checked group).
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
            {({ isFocusVisible, isSelected, isIndeterminate }) => (
              <>
                <CheckMark
                  isSelected={isSelected}
                  isIndeterminate={isIndeterminate}
                  className={styles.mark({
                    className: focusRing({ isFocusVisible }),
                  })}
                />
                <span className={styles.label()}>{children}</span>
              </>
            )}
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
