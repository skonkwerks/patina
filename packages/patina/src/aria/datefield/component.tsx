import { useRef } from 'react';
import {
  DateField as AriaDateField,
  type DateFieldProps as AriaDateFieldProps,
  type DateValue,
  FieldError,
} from 'react-aria-components';
import { tv } from 'tailwind-variants';

import { fieldBoxStyles, fieldStyles } from '../../internal/field.js';
import {
  FieldHeader,
  type FieldHeaderProps,
} from '../../internal/fieldheader.js';
import { useShownErrorFollowsValue } from '../../internal/shownerror.js';
import { DateInput } from './input.js';

/**
 * The box around the segments: the shared field box, one line tall, as a text field's input is. A
 * value wider than the box (a long date with a time zone) scrolls inside it rather than widening
 * the field. `TimeField` draws the same box.
 */
export const dateFieldInputStyles = tv({
  extend: fieldBoxStyles,
  base: 'flex h-8 cursor-text [scrollbar-width:none] items-center overflow-x-auto px-3 whitespace-nowrap',
});

export type DateFieldProps<T extends DateValue> = Omit<
  AriaDateFieldProps<T>,
  'className' | 'children'
> &
  FieldHeaderProps & {
    /** The visible label; a field in a toolbar may carry `aria-label` instead. */
    label?: string;
    /** The error to show under the field; also marks the field invalid. */
    errorMessage?: string;
    className?: string;
  };

/**
 * A labeled date, typed segment by segment: the arrow keys move between the segments and step the
 * focused one, and digits fill it. The order and the separators of the segments follow the locale,
 * as React Aria formats them. The value is an `@internationalized/date` object, which the field
 * only passes through: `CalendarDate` for a day, `CalendarDateTime` or `ZonedDateTime` with a
 * `granularity` finer than a day.
 */
export const DateField = <T extends DateValue>({
  label,
  optionalText,
  info,
  description,
  errorMessage,
  className,
  ...rest
}: DateFieldProps<T>) => {
  const field = useRef<HTMLDivElement>(null);
  useShownErrorFollowsValue(field, rest.value);
  return (
    <AriaDateField
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
            <FieldHeader
              label={label}
              optionalText={optionalText}
              info={info}
              description={description}
              isDisabled={isDisabled}
            />
            <DateInput
              className={(renderProps) => dateFieldInputStyles(renderProps)}
            />
            <FieldError className={parts.error()}>{errorMessage}</FieldError>
          </>
        );
      }}
    </AriaDateField>
  );
};
