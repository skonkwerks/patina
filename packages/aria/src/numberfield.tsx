import { useRef } from 'react';
import {
  Button as AriaButton,
  FieldError,
  Group,
  Input,
  Label,
  NumberField as AriaNumberField,
  type NumberFieldProps as AriaNumberFieldProps,
  Text,
} from 'react-aria-components';
import { tv } from 'tailwind-variants';

import { focusRing } from './focus.ts';
import { iconButtonStyles } from './iconbutton.tsx';
import { IconChevronDown, IconChevronUp } from './icons.tsx';
import { useShownErrorFollowsValue } from './shownerror.ts';

export const numberFieldStyles = tv({
  slots: {
    root: 'flex flex-col gap-1',
    label: 'text-surface-foreground text-sm font-medium',
    input:
      'disabled:text-input-placeholder min-w-0 flex-1 bg-transparent px-3 text-sm tabular-nums outline-0 disabled:cursor-not-allowed',
    stepper: 'border-input-border flex h-full w-6 shrink-0 flex-col border-l',
    increment: 'h-auto min-h-0 w-6 flex-1 rounded-none',
    decrement:
      'border-input-border h-auto min-h-0 w-6 flex-1 rounded-none border-t',
    stepIcon: 'h-3 w-3',
    description: 'text-surface-foreground-muted text-xs',
    error: 'text-destructive text-xs',
  },
});

/** The box around the input and its steppers, which carries the shared focus ring. */
export const numberFieldGroupStyles = tv({
  extend: focusRing,
  base: 'bg-input text-input-foreground border-input-border flex h-8 items-center overflow-hidden rounded-md border',
  variants: { isInvalid: { true: 'border-destructive' } },
});

export type NumberFieldProps = Omit<AriaNumberFieldProps, 'className'> & {
  label?: string;
  description?: string;
  errorMessage?: string;
  className?: string;
};

/** A numeric input with native parsing, bounds, and accessible step controls. */
export const NumberField = ({
  label,
  description,
  errorMessage,
  className,
  ...rest
}: NumberFieldProps) => {
  const field = useRef<HTMLDivElement>(null);
  useShownErrorFollowsValue(field, rest.value);
  const styles = numberFieldStyles();
  return (
    <AriaNumberField
      ref={field}
      {...rest}
      // An explicit isInvalid makes React Aria skip `validate` and native constraints, so it is set
      // only for a caller's error.
      isInvalid={errorMessage === undefined ? rest.isInvalid : true}
      className={styles.root({ className })}
    >
      {label && <Label className={styles.label()}>{label}</Label>}
      <Group className={(renderProps) => numberFieldGroupStyles(renderProps)}>
        <Input className={styles.input()} />
        <div className={styles.stepper()}>
          {/* React Aria names the stepper buttons ("Increase <label>", "Decrease <label>") through their slots. */}
          <AriaButton
            slot='increment'
            className={(renderProps) =>
              iconButtonStyles({
                ...renderProps,
                variant: 'ghost',
                size: 'sm',
                className: styles.increment(),
              })
            }
          >
            <IconChevronUp aria-hidden className={styles.stepIcon()} />
          </AriaButton>
          <AriaButton
            slot='decrement'
            className={(renderProps) =>
              iconButtonStyles({
                ...renderProps,
                variant: 'ghost',
                size: 'sm',
                className: styles.decrement(),
              })
            }
          >
            <IconChevronDown aria-hidden className={styles.stepIcon()} />
          </AriaButton>
        </div>
      </Group>
      {description && (
        <Text slot='description' className={styles.description()}>
          {description}
        </Text>
      )}
      <FieldError className={styles.error()}>{errorMessage}</FieldError>
    </AriaNumberField>
  );
};
