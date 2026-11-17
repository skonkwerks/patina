import type { ReactNode } from 'react';
import {
  CheckboxGroup as AriaCheckboxGroup,
  type CheckboxGroupProps as AriaCheckboxGroupProps,
  FieldError,
  Label,
  Text,
} from 'react-aria-components';
import { tv } from 'tailwind-variants';

import { fieldStyles } from '../../internal/field.ts';

/** The group's own spacing between its checkboxes; its label and help are the shared field parts. */
export const checkboxGroupStyles = tv({ base: 'gap-2' });

export type CheckboxGroupProps = Omit<
  AriaCheckboxGroupProps,
  'className' | 'children'
> & {
  /** The visible label; a group under a heading that names it carries `aria-label` instead. */
  label?: string;
  description?: string;
  errorMessage?: string;
  /** The checkboxes, each with the `value` the group's selection holds. */
  children: ReactNode;
  className?: string;
};

/**
 * A labelled set of checkboxes whose selection is the list of the checked values. While the group
 * is disabled, its label and description are drawn disabled, and each checkbox draws its own.
 */
export const CheckboxGroup = ({
  label,
  description,
  errorMessage,
  children,
  className,
  ...rest
}: CheckboxGroupProps) => (
  <AriaCheckboxGroup
    {...rest}
    // An explicit isInvalid makes React Aria skip `validate` and `isRequired`, so it is set only
    // for a caller's error.
    isInvalid={errorMessage === undefined ? rest.isInvalid : true}
    className={fieldStyles().root({
      className: checkboxGroupStyles({ className }),
    })}
  >
    {({ isDisabled }) => {
      const parts = fieldStyles({ isDisabled });
      return (
        <>
          {label && <Label className={parts.label()}>{label}</Label>}
          {description && (
            <Text slot='description' className={parts.description()}>
              {description}
            </Text>
          )}
          {children}
          <FieldError className={parts.error()}>{errorMessage}</FieldError>
        </>
      );
    }}
  </AriaCheckboxGroup>
);
