import type { ReactNode } from 'react';
import {
  CheckboxButton,
  CheckboxField,
  type CheckboxFieldProps,
  CheckboxGroup as AriaCheckboxGroup,
  type CheckboxGroupProps as AriaCheckboxGroupProps,
  FieldError,
  Label,
  Text,
} from 'react-aria-components';
import { tv } from 'tailwind-variants';

import { IconCheck } from './icons.tsx';

export const checkboxStyles = tv({
  slots: {
    root: 'flex flex-col',
    // Positioned, so the hidden input React Aria puts inside the label stays over it.
    button: 'group relative flex items-start gap-3 text-sm',
    box: [
      'border-surface-border bg-neutral group-selected:bg-primary mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border',
      'group-focus-visible:outline-focus-ring group-focus-visible:outline-2 group-focus-visible:outline-offset-2',
      'group-disabled:opacity-50',
    ],
    check:
      'text-primary-foreground group-selected:opacity-100 h-4 w-4 opacity-0',
    label: 'text-surface-foreground font-medium',
    // Indented to stand under the label: the mark's width and the gap after it.
    description: 'text-surface-foreground-muted ms-8 text-xs',
  },
});

export const checkboxGroupStyles = tv({
  slots: {
    root: 'flex flex-col gap-2',
    label: 'text-surface-foreground text-sm font-medium',
    description: 'text-surface-foreground-muted text-xs',
    error: 'text-destructive text-xs',
  },
});

export type CheckboxProps = Omit<
  CheckboxFieldProps,
  'className' | 'children'
> & {
  children: string;
  description?: string;
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
  className,
  ...rest
}: CheckboxProps) => {
  const styles = checkboxStyles();
  return (
    <CheckboxField {...rest} className={styles.root({ className })}>
      <CheckboxButton className={styles.button()}>
        <span className={styles.box()}>
          <IconCheck aria-hidden className={styles.check()} strokeWidth={2.5} />
        </span>
        <span className={styles.label()}>{children}</span>
      </CheckboxButton>
      {description && (
        <Text slot='description' className={styles.description()}>
          {description}
        </Text>
      )}
    </CheckboxField>
  );
};

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

/** A labelled set of checkboxes whose selection is the list of the checked values. */
export const CheckboxGroup = ({
  label,
  description,
  errorMessage,
  children,
  className,
  ...rest
}: CheckboxGroupProps) => {
  const styles = checkboxGroupStyles();
  return (
    <AriaCheckboxGroup
      {...rest}
      isInvalid={errorMessage === undefined ? rest.isInvalid : true}
      className={styles.root({ className })}
    >
      {label && <Label className={styles.label()}>{label}</Label>}
      {description && (
        <Text slot='description' className={styles.description()}>
          {description}
        </Text>
      )}
      {children}
      <FieldError className={styles.error()}>{errorMessage}</FieldError>
    </AriaCheckboxGroup>
  );
};
