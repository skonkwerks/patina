import { IconCalendar } from '@tabler/icons-react';
import { useRef } from 'react';
import {
  Button as AriaButton,
  DatePicker as AriaDatePicker,
  type DatePickerProps as AriaDatePickerProps,
  type DateValue,
  Dialog as AriaDialog,
  FieldError,
  Group,
} from 'react-aria-components';
import { tv } from 'tailwind-variants';

import { fieldBoxStyles, fieldStyles } from '../../internal/field.ts';
import {
  FieldHeader,
  type FieldHeaderProps,
} from '../../internal/fieldheader.tsx';
import { useShownErrorFollowsValue } from '../../internal/shownerror.ts';
import { CalendarLayerContext } from '../calendar/context.ts';
import { Calendar } from '../calendar/index.ts';
import { DateInput } from '../datefield/input.tsx';
import { iconButtonStyles } from '../iconbutton/index.ts';
import { Popover } from '../popover/index.ts';

/**
 * The parts of `DatePicker` inside its box: the segments, the button that opens the calendar, and
 * the popover and its dialog around the calendar. The button is a ghost icon button made 24px, so
 * its focus ring, drawn against its edge, stays inside the box's border; the box drops its own
 * ring meanwhile (`datePickerGroupStyles`), so one ring marks the button.
 */
export const datePickerStyles = tv({
  slots: {
    input:
      'flex min-w-0 flex-1 [scrollbar-width:none] items-center overflow-x-auto px-3 whitespace-nowrap',
    button: 'me-1 size-6 outline-offset-0',
    buttonIcon: 'h-4 w-4',
    popover: 'max-w-[calc(100vw-2rem)] overflow-auto p-3',
    dialog: 'outline-0',
  },
});

/**
 * The box around the segments and the calendar button: the shared field box, one line tall. React
 * Aria's group reports keyboard focus anywhere inside it, so the box draws the shared ring while a
 * segment holds the focus and drops it while the calendar button does, which draws its own.
 */
export const datePickerGroupStyles = tv({
  extend: fieldBoxStyles,
  base: 'flex h-8 cursor-text items-center has-[>button[data-focus-visible]]:outline-0',
});

export type DatePickerProps<T extends DateValue> = Omit<
  AriaDatePickerProps<T>,
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
 * A date typed segment by segment as in `DateField`, with a button that opens a `Calendar` in a
 * popover. Alt+Down Arrow in the field opens it too; choosing a day closes it, and so does Escape,
 * with the focus back where it was. React Aria names the button ("Calendar") and the popover. The
 * value is an `@internationalized/date` object the picker only passes through; `minValue`,
 * `maxValue` and `isDateUnavailable` hold for the field and the calendar alike.
 */
export const DatePicker = <T extends DateValue>({
  label,
  optionalText,
  info,
  description,
  errorMessage,
  className,
  ...rest
}: DatePickerProps<T>) => {
  const field = useRef<HTMLDivElement>(null);
  useShownErrorFollowsValue(field, rest.value);
  const styles = datePickerStyles();
  return (
    <AriaDatePicker
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
              className={(renderProps) => datePickerGroupStyles(renderProps)}
            >
              <DateInput className={styles.input()} />
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
                  <Calendar />
                </CalendarLayerContext>
              </AriaDialog>
            </Popover>
          </>
        );
      }}
    </AriaDatePicker>
  );
};
