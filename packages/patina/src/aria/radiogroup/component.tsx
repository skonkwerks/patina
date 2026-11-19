import type { ReactNode } from 'react';
import {
  FieldError,
  RadioGroup as AriaRadioGroup,
  type RadioGroupProps as AriaRadioGroupProps,
} from 'react-aria-components';
import { tv } from 'tailwind-variants';

import { fieldStyles } from '../../internal/field.js';
import {
  FieldHeader,
  type FieldHeaderProps,
} from '../../internal/fieldheader.js';

/**
 * The group's own spacing and the column its choices stand in; its header and error are the shared
 * field parts.
 */
export const radioGroupStyles = tv({
  slots: {
    root: 'gap-2',
    options: 'flex flex-col gap-2',
  },
});

export type RadioGroupProps = Omit<
  AriaRadioGroupProps,
  'className' | 'children'
> &
  FieldHeaderProps & {
    /** The visible label; a group under a heading that names it carries `aria-label` instead. */
    label?: string;
    errorMessage?: string;
    /** The choices, each a `Radio` with the `value` the group holds when it is chosen. */
    children: ReactNode;
    className?: string;
  };

/**
 * A labelled choice of exactly one among a few that exclude one another, each said in full: its
 * name, and what choosing it means, with `Radio`'s `description` where the name doesn't already
 * say it (a page size's "20 rows" needs none). It is what a yes or no becomes when both answers
 * need explaining; a yes or no that explains itself is a `Checkbox` in a form and a `Switch` where
 * it takes effect at once. The choices stand under the shared field header, with the group's error
 * under them. While the group is disabled, its label is drawn disabled, and each choice draws its
 * own.
 */
export const RadioGroup = ({
  label,
  optionalText,
  info,
  description,
  errorMessage,
  children,
  className,
  ...rest
}: RadioGroupProps) => {
  const styles = radioGroupStyles();
  return (
    <AriaRadioGroup
      {...rest}
      // An explicit isInvalid makes React Aria skip `validate` and `isRequired`, so it is set only
      // for a caller's error.
      isInvalid={errorMessage === undefined ? rest.isInvalid : true}
      className={fieldStyles().root({
        className: styles.root({ className }),
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
          <div className={styles.options()}>{children}</div>
          <FieldError className={fieldStyles().error()}>
            {errorMessage}
          </FieldError>
        </>
      )}
    </AriaRadioGroup>
  );
};
