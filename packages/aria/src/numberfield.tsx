import { IconChevronDown, IconChevronUp } from '@tabler/icons-react';
import { useRef } from 'react';
import {
  Button as AriaButton,
  type ButtonRenderProps,
  FieldError,
  Group,
  Input,
  Label,
  NumberField as AriaNumberField,
  type NumberFieldProps as AriaNumberFieldProps,
  Text,
} from 'react-aria-components';
import { tv } from 'tailwind-variants';

import { fieldBoxStyles, fieldStyles } from './field.ts';
import { iconButtonStyles } from './iconbutton.tsx';
import { useShownErrorFollowsValue } from './shownerror.ts';

export const numberFieldStyles = tv({
  slots: {
    input: 'min-w-0 flex-1 bg-transparent px-3 text-sm tabular-nums outline-0',
    stepper: 'border-input-border flex h-full w-6 shrink-0 flex-col border-l',
    increment: 'h-auto min-h-0 w-6 flex-1 rounded-none',
    decrement:
      'border-input-border h-auto min-h-0 w-6 flex-1 rounded-none border-t',
    stepIcon: 'h-3 w-3',
  },
});

/** The box around the input and its steppers: the shared field box. */
export const numberFieldGroupStyles = tv({
  extend: fieldBoxStyles,
  base: 'flex h-8 items-center overflow-hidden',
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
      className={fieldStyles().root({ className })}
    >
      {({ isDisabled }) => {
        const parts = fieldStyles({ isDisabled });
        // A stepper is faded only for its own reason (a bound reached); inside a disabled field the
        // box is already faded, and a second fade would compound it.
        const stepperStyles = (
          renderProps: ButtonRenderProps,
          className: string,
        ) =>
          iconButtonStyles({
            ...renderProps,
            isDisabled: renderProps.isDisabled && !isDisabled,
            variant: 'ghost',
            size: 'sm',
            className,
          });
        return (
          <>
            {label && <Label className={parts.label()}>{label}</Label>}
            <Group
              className={(renderProps) => numberFieldGroupStyles(renderProps)}
            >
              <Input className={styles.input()} />
              <div className={styles.stepper()}>
                {/* React Aria names the stepper buttons ("Increase <label>", "Decrease <label>") through their slots. */}
                <AriaButton
                  slot='increment'
                  className={(renderProps) =>
                    stepperStyles(renderProps, styles.increment())
                  }
                >
                  <IconChevronUp aria-hidden className={styles.stepIcon()} />
                </AriaButton>
                <AriaButton
                  slot='decrement'
                  className={(renderProps) =>
                    stepperStyles(renderProps, styles.decrement())
                  }
                >
                  <IconChevronDown aria-hidden className={styles.stepIcon()} />
                </AriaButton>
              </div>
            </Group>
            {description && (
              <Text slot='description' className={parts.description()}>
                {description}
              </Text>
            )}
            <FieldError className={parts.error()}>{errorMessage}</FieldError>
          </>
        );
      }}
    </AriaNumberField>
  );
};
