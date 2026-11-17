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

export const radioGroupStyles = tv({
  slots: {
    root: 'flex flex-col gap-2',
    label: 'text-surface-foreground text-sm font-medium',
    description: 'text-surface-foreground-muted text-xs',
    error: 'text-destructive text-xs',
    options: 'flex flex-col gap-2',
  },
});

export const radioStyles = tv({
  slots: {
    root: 'flex flex-col',
    // Positioned, so the hidden input React Aria puts inside the label stays over it.
    button: 'group relative flex items-start gap-3 text-sm',
    mark: [
      'border-surface-border bg-neutral mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border',
      'group-focus-visible:outline-focus-ring group-focus-visible:outline-2 group-focus-visible:outline-offset-2',
      'group-disabled:opacity-50',
    ],
    dot: 'bg-primary group-selected:opacity-100 h-2.5 w-2.5 rounded-full opacity-0',
    label: 'text-surface-foreground font-medium',
    // Indented to stand under the name: the mark's width and the gap after it.
    description: 'text-surface-foreground-muted ms-8 text-xs',
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
 * and a `Switch` where it takes effect at once.
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
      className={styles.root({ className })}
    >
      {label && <Label className={styles.label()}>{label}</Label>}
      <div className={styles.options()}>{children}</div>
      {description && (
        <Text slot='description' className={styles.description()}>
          {description}
        </Text>
      )}
      <FieldError className={styles.error()}>{errorMessage}</FieldError>
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
}: RadioProps) => {
  const styles = radioStyles();
  return (
    <RadioField {...rest} className={styles.root({ className })}>
      <RadioButton className={styles.button()}>
        <span className={styles.mark()}>
          <span className={styles.dot()} />
        </span>
        <span className={styles.label()}>{children}</span>
      </RadioButton>
      {description && (
        <Text slot='description' className={styles.description()}>
          {description}
        </Text>
      )}
    </RadioField>
  );
};
