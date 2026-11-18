import { type ReactNode, useRef } from 'react';
import {
  FieldError,
  Label,
  Text,
  TimeField as AriaTimeField,
  type TimeFieldProps as AriaTimeFieldProps,
  type TimeValue,
} from 'react-aria-components';
import { tv } from 'tailwind-variants';

import { fieldStyles } from '../../internal/field.ts';
import { useShownErrorFollowsValue } from '../../internal/shownerror.ts';
import { dateFieldInputStyles } from '../datefield/index.ts';
import { DateInput } from '../datefield/input.tsx';

/** The box around the segments: `DateField`'s, which an app may extend for times alone. */
export const timeFieldInputStyles = tv({ extend: dateFieldInputStyles });

export type TimeFieldProps<T extends TimeValue> = Omit<
  AriaTimeFieldProps<T>,
  'className' | 'children'
> & {
  /** The visible label; a field in a toolbar may carry `aria-label` instead. */
  label?: string;
  /** Optional help control beside the label, outside the label itself. */
  contextualHelp?: ReactNode;
  description?: string;
  /** The error to show under the field; also marks the field invalid. */
  errorMessage?: string;
  className?: string;
};

/**
 * A labeled time of day, typed segment by segment as a `DateField` is, in the same box. The locale
 * decides the 12- or 24-hour clock unless `hourCycle` sets it; `granularity` sets the smallest unit
 * shown (`hour`, `minute`, the default, or `second`). The value is an `@internationalized/date`
 * object the field only passes through: a `Time`, or a `CalendarDateTime` or `ZonedDateTime` of
 * which only the time is shown.
 */
export const TimeField = <T extends TimeValue>({
  label,
  contextualHelp,
  description,
  errorMessage,
  className,
  ...rest
}: TimeFieldProps<T>) => {
  const field = useRef<HTMLDivElement>(null);
  useShownErrorFollowsValue(field, rest.value);
  return (
    <AriaTimeField
      ref={field}
      {...rest}
      // An explicit isInvalid makes React Aria skip `validate` and native constraints, so it is set
      // only for a caller's error.
      isInvalid={errorMessage === undefined ? rest.isInvalid : true}
      className={fieldStyles().root({ className })}
    >
      {({ isDisabled }) => {
        const parts = fieldStyles({ isDisabled });
        return (
          <>
            {label && (
              <div className={parts.labelRow()}>
                <Label className={parts.label()}>{label}</Label>
                {contextualHelp}
              </div>
            )}
            <DateInput
              className={(renderProps) => timeFieldInputStyles(renderProps)}
            />
            {description && (
              <Text slot='description' className={parts.description()}>
                {description}
              </Text>
            )}
            <FieldError className={parts.error()}>{errorMessage}</FieldError>
          </>
        );
      }}
    </AriaTimeField>
  );
};
