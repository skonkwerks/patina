import type { ReactNode } from 'react';
import {
  CheckboxGroup as AriaCheckboxGroup,
  type CheckboxGroupProps as AriaCheckboxGroupProps,
  FieldError,
} from 'react-aria-components';
import { tv } from 'tailwind-variants';

import { fieldStyles } from '../../internal/field.ts';
import {
  FieldHeader,
  type FieldHeaderProps,
} from '../../internal/fieldheader.tsx';

/** The group's own spacing between its checkboxes; its header and error are the shared parts. */
export const checkboxGroupStyles = tv({ base: 'gap-2' });

export type CheckboxGroupProps = Omit<
  AriaCheckboxGroupProps,
  'className' | 'children'
> &
  FieldHeaderProps & {
    /** The visible label; a group under a heading that names it carries `aria-label` instead. */
    label?: string;
    errorMessage?: string;
    /** The checkboxes, each with the `value` the group's selection holds. */
    children: ReactNode;
    className?: string;
  };

/**
 * A labelled set of checkboxes whose selection is the list of the checked values, under the shared
 * field header, with its error under the checkboxes. While the group is disabled, its label is
 * drawn disabled, and each checkbox draws its own.
 */
export const CheckboxGroup = ({
  label,
  optionalText,
  info,
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
    {({ isDisabled }) => (
      <>
        <FieldHeader
          label={label}
          optionalText={optionalText}
          info={info}
          description={description}
          isDisabled={isDisabled}
        />
        {children}
        <FieldError className={fieldStyles().error()}>
          {errorMessage}
        </FieldError>
      </>
    )}
  </AriaCheckboxGroup>
);
