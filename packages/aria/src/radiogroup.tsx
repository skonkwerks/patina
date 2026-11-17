import type { ReactNode } from 'react';
import {
  FieldError,
  Label,
  RadioButton,
  RadioField,
  type RadioFieldProps,
  RadioGroup as AriaRadioGroup,
  type RadioGroupProps as AriaRadioGroupProps,
  Text,
} from 'react-aria-components';
import { tv } from 'tailwind-variants';

import { choiceControlStyles, fieldStyles } from './field.ts';
import { focusRing } from './focus.ts';

/** The group's own spacing and the column its choices stand in; its label and help are the shared field parts. */
export const radioGroupStyles = tv({
  slots: {
    root: 'gap-2',
    options: 'flex flex-col gap-2',
  },
});

/** A radio choice: the shared choice control with a round mark that shows a dot when chosen. */
export const radioStyles = tv({
  extend: choiceControlStyles,
  slots: {
    mark: 'border-surface-border bg-neutral w-5 justify-center rounded-full border',
    dot: 'bg-primary group-selected:opacity-100 h-2.5 w-2.5 rounded-full opacity-0',
  },
});

export type RadioGroupProps = Omit<
  AriaRadioGroupProps,
  'className' | 'children'
> & {
  /** The visible label; a group under a heading that names it carries `aria-label` instead. */
  label?: string;
  description?: string;
  errorMessage?: string;
  /** The choices, each a `Radio` with the `value` the group holds when it is chosen. */
  children: ReactNode;
  className?: string;
};

/**
 * A labelled choice of exactly one among a few that exclude one another, each said in full: its
 * name and, with `Radio`'s `description`, what choosing it means. It is what a yes or no becomes
 * when both answers need explaining; a yes or no that explains itself is a `Checkbox` in a form
 * and a `Switch` where it takes effect at once. While the group is disabled, its label and
 * description are drawn disabled, and each choice draws its own.
 */
export const RadioGroup = ({
  label,
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
      {({ isDisabled }) => {
        const parts = fieldStyles({ isDisabled });
        return (
          <>
            {label && <Label className={parts.label()}>{label}</Label>}
            {/* The description stands under the label, as in every field, before the choices. */}
            {description && (
              <Text slot='description' className={parts.description()}>
                {description}
              </Text>
            )}
            <div className={styles.options()}>{children}</div>
            <FieldError className={parts.error()}>{errorMessage}</FieldError>
          </>
        );
      }}
    </AriaRadioGroup>
  );
};

export type RadioProps = Omit<RadioFieldProps, 'className' | 'children'> & {
  /** The choice's name. */
  children: string;
  /** What choosing it means, under its name. */
  description?: string;
  className?: string;
};

/** One choice of a `RadioGroup`: its mark, its name, and what choosing it means. */
export const Radio = ({
  children,
  description,
  className,
  ...rest
}: RadioProps) => (
  <RadioField {...rest} className={radioStyles().root({ className })}>
    {({ isDisabled }) => {
      const styles = radioStyles({ isDisabled });
      return (
        <>
          <RadioButton className={styles.button()}>
            {({ isFocusVisible }) => (
              <>
                <span
                  className={styles.mark({
                    className: focusRing({ isFocusVisible }),
                  })}
                >
                  <span className={styles.dot()} />
                </span>
                <span className={styles.label()}>{children}</span>
              </>
            )}
          </RadioButton>
          {description && (
            <Text slot='description' className={styles.description()}>
              {description}
            </Text>
          )}
        </>
      );
    }}
  </RadioField>
);
