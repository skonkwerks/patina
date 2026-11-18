import { IconCalendar } from '@tabler/icons-react';
import { useRef } from 'react';
import {
  Button as AriaButton,
  DateRangePicker as AriaDateRangePicker,
  type DateRangePickerProps as AriaDateRangePickerProps,
  type DateValue,
  Dialog as AriaDialog,
  FieldError,
  Group,
} from 'react-aria-components';
import { tv } from 'tailwind-variants';

import { fieldStyles } from '../../internal/field.js';
import {
  FieldHeader,
  type FieldHeaderProps,
} from '../../internal/fieldheader.js';
import { useShownErrorFollowsValue } from '../../internal/shownerror.js';
import { CalendarLayerContext } from '../calendar/context.js';
import { DateInput } from '../datefield/input.js';
import {
  datePickerGroupStyles,
  datePickerStyles,
} from '../datepicker/index.js';
import { iconButtonStyles } from '../iconbutton/index.js';
import { Popover } from '../popover/index.js';
import { RangeCalendar } from '../rangecalendar/index.js';

/**
 * The parts of `DateRangePicker`: `DatePicker`'s, and the two dates in the box, start and end, with
 * a short dash drawn between them. The dash is a border, not a character, so the component holds
 * no text of its own and forced colors keep it as a line; it is hidden from assistive technology,
 * which hears each date by its own name.
 */
export const dateRangePickerStyles = tv({
  extend: datePickerStyles,
  slots: {
    inputs:
      'flex min-w-0 flex-1 [scrollbar-width:none] items-center overflow-x-auto',
    start: 'flex items-center ps-3 pe-2 whitespace-nowrap',
    separator: 'border-input-foreground h-0 w-2 shrink-0 border-t',
    end: 'flex flex-1 items-center ps-2 pe-3 whitespace-nowrap',
  },
});

/** The box around the two dates and the calendar button: `DatePicker`'s. */
export const dateRangePickerGroupStyles = tv({ extend: datePickerGroupStyles });

export type DateRangePickerProps<T extends DateValue> = Omit<
  AriaDateRangePickerProps<T>,
  'className' | 'children'
> &
  FieldHeaderProps & {
    /** The visible label; a picker in a toolbar may carry `aria-label` instead. */
    label?: string;
    /** The error to show under the field; also marks the field invalid. */
    errorMessage?: string;
    className?: string;
  };

/**
 * A range of two dates, start and end, each typed segment by segment as in `DateField`, with a
 * button that opens a `RangeCalendar` in a popover; it looks and behaves as `DatePicker` does.
 * React Aria names the two dates ("Start Date", "End Date") and the button. The value is a
 * `{ start, end }` of `@internationalized/date` objects the picker only passes through; `startName`
 * and `endName` submit the two dates with a form.
 */
export const DateRangePicker = <T extends DateValue>({
  label,
  optionalText,
  info,
  description,
  errorMessage,
  className,
  ...rest
}: DateRangePickerProps<T>) => {
  const field = useRef<HTMLDivElement>(null);
  useShownErrorFollowsValue(field, rest.value);
  const styles = dateRangePickerStyles();
  return (
    <AriaDateRangePicker
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
            <Group
              className={(renderProps) =>
                dateRangePickerGroupStyles(renderProps)
              }
            >
              <div className={styles.inputs()}>
                <DateInput slot='start' className={styles.start()} />
                <span aria-hidden className={styles.separator()} />
                <DateInput slot='end' className={styles.end()} />
              </div>
              <AriaButton
                className={(renderProps) =>
                  iconButtonStyles({
                    ...renderProps,
                    // Inside a disabled picker the box is already faded; a second fade would compound.
                    isDisabled: renderProps.isDisabled && !isDisabled,
                    variant: 'ghost',
                    size: 'sm',
                    className: styles.button(),
                  })
                }
              >
                <IconCalendar aria-hidden className={styles.buttonIcon()} />
              </AriaButton>
            </Group>
            <FieldError className={parts.error()}>{errorMessage}</FieldError>
            <Popover className={styles.popover()}>
              {/* React Aria names the dialog from the field's label, through the dialog's context. */}
              <AriaDialog className={styles.dialog()}>
                <CalendarLayerContext value='overlay'>
                  <RangeCalendar />
                </CalendarLayerContext>
              </AriaDialog>
            </Popover>
          </>
        );
      }}
    </AriaDateRangePicker>
  );
};
